import { CoreMessage, generateText } from "ai";

import { aiParams } from "@/llm/ai-params";
import { getSystemPrompt } from "@/llm/system-prompt";
import { Conversation, ServerMessage } from "@/llm/types";

import { sql } from "./sql";

const summarizeConversation = async (conversationID: string) => {
  const conversation = await get({ conversationID });
  const messages = conversation.messages;
  const userMessageCount = messages.filter((m) => m.role === "user").length;
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
  await sql`UPDATE chat_histories SET title = ${title} WHERE conversation_id = ${conversationID}`;
};

const MAX_CONVERSATIONS = 20;

const deletePreviousConversations = async (userID: string) => {
  await sql`
    DELETE FROM chat_histories
    WHERE user_id = ${userID}
    AND conversation_id NOT IN (
      SELECT conversation_id
      FROM chat_histories
      WHERE user_id = ${userID}
      ORDER BY created_at DESC
      LIMIT ${MAX_CONVERSATIONS}
    )
  `;
};

export const save = async ({ conversationID, ownerID, messages }: Pick<Conversation, 'conversationID' | 'ownerID' | 'messages'>): Promise<void> => {
  const formattedMessages = process.env.USE_NEON ? JSON.stringify(messages) : (messages as any);

  await sql`
    INSERT INTO chat_histories (conversation_id, user_id, messages, updated_at)
    VALUES (
      ${conversationID},
      ${ownerID},
      ${formattedMessages}::json,
      NOW()
    )
    ON CONFLICT (conversation_id, user_id)
    DO UPDATE SET messages = EXCLUDED.messages, updated_at = NOW();
  `;

  await deletePreviousConversations(ownerID);

  await summarizeConversation(conversationID);
};

export const get = async ({ conversationID }: { conversationID: string }): Promise<Conversation> => {
  const result = await sql`
    SELECT messages,
      title,
      conversation_id as "conversationID",
      user_id as "ownerID",
      updated_at as "updatedAt",
      created_at as "createdAt"
    FROM chat_histories
    WHERE conversation_id = ${conversationID}
  `;

  return result[0]
    ? (result[0] as Conversation)
    : { conversationID, title: "New chat", messages: [], ownerID: "", createdAt: new Date(), updatedAt: new Date() };
};

/**
 * The conversation metadata without the messages.
 */
export type ConversationData = Omit<Conversation, "messages">;

export const list = async ({ ownerID }: { ownerID: string }): Promise<ConversationData[]> => {
  const r = await sql`
    SELECT title,
          conversation_id as "conversationID",
          user_id as "ownerID",
          updated_at as "updatedAt",
          created_at as "createdAt"
    FROM chat_histories
    WHERE user_id = ${ownerID}
    ORDER BY created_at DESC
    LIMIT 20
  `;

  await Promise.all(
    r.map(async (c) => {
      if (c.title) {
        return;
      }
      await summarizeConversation(c.conversationID);
    })
  );

  return r.map((c) => c as ConversationData);
};
