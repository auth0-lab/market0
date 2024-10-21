import { CoreMessage, generateId, generateText } from "ai";
import { PendingQuery } from "postgres";

import { aiParams } from "@/llm/ai-params";
import { getSystemPrompt } from "@/llm/system-prompt";
import { Conversation, ServerMessage } from "@/llm/types";
import { fgaClient } from "@/sdk/fga";
import { Claims } from "@auth0/nextjs-auth0";

import { chatUsers } from "./";
import { sql } from "./sql";

const summarizeConversation = async (id: string, messages?: ServerMessage[]) => {
  if (typeof messages === undefined) {
    const conversation = await get(id);
    if (!conversation) { return; }
    messages = conversation.messages;
  }

  const userMessageCount = (messages ?? []).filter((m) => m.role === "user").length;
  if (userMessageCount > 4 || userMessageCount === 0) {
    return;
  }

  const { text } = await generateText({
    ...aiParams,
    system: await getSystemPrompt(),
    messages: [
      ...(messages as CoreMessage[]),
      {
        role: "user",
        content: `Generate title of max 5 words summarizing the main topic(s) of this conversation. Always use tickers instead of company names.
      `,
      },
    ],
  });
  //remove start and end quotes
  const title = text.replace(/^"|"$/g, "");
  await sql`UPDATE conversations SET title = ${title} WHERE id = ${id}`;
};

const MAX_CONVERSATIONS = process.env.MAX_CONVERSATIONS ?
  parseInt(process.env.MAX_CONVERSATIONS, 10) :
  5;

const deletePreviousConversations = async (ownerID: string) => {
  await sql`
    DELETE FROM conversations
    WHERE owner_id = ${ownerID}
    AND id NOT IN (
      SELECT id
      FROM conversations
      WHERE owner_id = ${ownerID}
      ORDER BY created_at DESC
      LIMIT ${MAX_CONVERSATIONS}
    ) AND not is_public
  `;
};

/**
 *
 * Creates a new conversation.
 *
 * @param param0
 * @param param0.owner - The owner of the conversation.
 * @returns
 */
export const create = async ({ owner }: { owner: Claims }): Promise<string> => {
  const maxRetries = 5;
  let retries = 0;
  let success = false;
  let id = generateId();

  while (retries < maxRetries && !success) {
    try {
      await sql`
        INSERT INTO conversations (id, owner_id, messages, title, updated_at)
        VALUES (
          ${id},
          ${owner.sub},
          '[]'::json,
          'New chat',
          NOW()
        )
      `;
      success = true;
    } catch (error: any) {
      id = generateId();
      retries++;
    }
  }

  if (!success) {
    throw new Error('Failed to create the conversation.');
  }

  await deletePreviousConversations(owner.sub);

  await fgaClient.writeTuples([
    {
      user: `user:${owner.sub}`,
      relation: "owner",
      object: `chat:${id}`,
    },
  ]);

  await chatUsers.add({
    chat_id: id,
    user_id: owner.sub,
    email: owner.email,
    access: "owner",
    status: "provisioned",
  });

  return id;
};

export const save = async ({ id, ownerID, messages, isPublic }:
  Pick<Conversation, 'id' | 'ownerID'> & Partial<Pick<Conversation, 'messages' | 'isPublic'>>
): Promise<void> => {
  if (messages !== undefined) {
    const formattedMessages = process.env.USE_NEON ? JSON.stringify(messages) : (messages as any);
    const updated = await sql`
      UPDATE conversations
      SET updated_at = NOW(),
        messages = ${formattedMessages}::json
      WHERE id = ${id} AND owner_id = ${ownerID}
      RETURNING id
    `;
    if (!updated[0]) {
      throw new Error('Conversation does not exists.');
    }
    await summarizeConversation(id, messages);
  }

  if (isPublic !== undefined) {
    const updated = await sql`
      UPDATE conversations
      SET is_public = ${isPublic},
        updated_at = NOW()
      WHERE id = ${id} AND owner_id = ${ownerID}
      RETURNING id
    `;
    if (!updated[0]) {
      throw new Error('Conversation does not exists.');
    }
  }
};

export const get = async (id: string): Promise<Conversation | undefined> => {
  const result = await sql`
    SELECT
      id,
      messages,
      title,
      owner_id as "ownerID",
      updated_at as "updatedAt",
      created_at as "createdAt"
    FROM conversations
    WHERE id = ${id}
  `;

  return result[0] as Conversation;
};

/**
 * The conversation metadata without the messages.
 */
export type ConversationData = Omit<Conversation, "messages">;

export const list = async ({ ownerID }: { ownerID: string }): Promise<ConversationData[]> => {
  const r = await sql`
    SELECT title,
          id,
          owner_id as "ownerID",
          updated_at as "updatedAt",
          created_at as "createdAt"
    FROM conversations
    WHERE owner_id = ${ownerID}
      AND messages IS NOT NULL
      AND jsonb_array_length(messages) > 0
    ORDER BY created_at DESC
    LIMIT 20
  `;

  await Promise.all(
    r.map(async (c) => {
      if (c.title) {
        return;
      }
      await summarizeConversation(c.id);
    })
  );

  return r.map((c) => c as ConversationData);
};
