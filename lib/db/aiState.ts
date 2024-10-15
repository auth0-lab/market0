import { CoreMessage, generateText } from "ai";

import { aiParams } from "@/llm/ai-params";
import { getSystemPrompt } from "@/llm/system-prompt";
import { Conversation, ServerMessage } from "@/llm/types";

import { sql } from "./sql";

export type SaveAIState = {
  conversationID: string;
  userID: string;
  messages: ServerMessage[];
  createdAt: Date;
  updatedAt: Date;
  title: string;
};

const summarizeConversation = async (conversationID: string) => {
  const conversation = await get({ conversationID });
  const messages = conversation.messages;
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  if (userMessageCount > 4 || userMessageCount === 0) {
    return;
  }

  const previousTitles = (
    await sql`
    SELECT title
    FROM chat_histories
    WHERE conversation_id != ${conversationID}
  `
  ).map((c: Partial<SaveAIState>) => c.title);

  const { text } = await generateText({
    ...aiParams,
    system: await getSystemPrompt(),
    messages: [
      ...(messages as CoreMessage[]),
      {
        role: "assistant",
        content: `Generate title of max 5 words summarizing the main topic(s) of this conversation. Do not use long names for companies or time references.
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

export const save = async ({ conversationID, userID, messages }: SaveAIState): Promise<void> => {
  const formattedMessages = process.env.USE_NEON ? JSON.stringify(messages) : (messages as any);

  await sql`
    INSERT INTO chat_histories (conversation_id, user_id, messages, updated_at)
    VALUES (
      ${conversationID},
      ${userID},
      ${formattedMessages}::json,
      NOW()
    )
    ON CONFLICT (conversation_id, user_id)
    DO UPDATE SET messages = EXCLUDED.messages, updated_at = NOW();
  `;

  await deletePreviousConversations(userID);

  await summarizeConversation(conversationID);
};

export const get = async ({ conversationID }: { conversationID: string }): Promise<Conversation> => {
  const result = await sql`
    SELECT messages,
      title,
      user_id as "ownerID",
      updated_at as "updatedAt",
      created_at as "createdAt"
    FROM chat_histories
    WHERE conversation_id = ${conversationID}
  `;

  return result[0]
    ? (result[0] as Conversation)
    : { messages: [], ownerID: "", title: "", createdAt: new Date(), updatedAt: new Date() };
};

/**
 * The conversation metadata without the messages.
 */
export type ConversationData = Omit<SaveAIState, "messages">;

export const list = async ({ ownerID }: { ownerID: string }): Promise<ConversationData[]> => {
  const r = await sql`
    SELECT conversation_id,
           user_id,
           title,
          updated_at,
          created_at
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
      await summarizeConversation(c.conversation_id);
    })
  );

  return r.map((c) => ({
    title: c.title,
    conversationID: c.conversation_id,
    userID: c.user_id,
    updatedAt: c.updated_at,
    createdAt: c.created_at,
  }));
};
