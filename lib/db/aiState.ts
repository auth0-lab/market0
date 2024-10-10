import { Conversation, ServerMessage } from "@/llm/types";

import { sql } from "./sql";

export type SaveAIState = {
  conversationID: string;
  userID: string;
  messages: ServerMessage[];
  createdAt: Date;
  updatedAt: Date;
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

  //A user can only have a maximum of 20 conversations
  await sql`
    DELETE FROM chat_histories
    WHERE user_id = ${userID}
    AND conversation_id NOT IN (
      SELECT conversation_id
      FROM chat_histories
      WHERE user_id = ${userID}
      ORDER BY created_at DESC
      LIMIT 20
    )
  `;
};

export const get = async ({ conversationID }: { conversationID: string }): Promise<Conversation> => {
  const result = await sql`
    SELECT messages,
      user_id as "ownerID",
          updated_at as "updatedAt",
          created_at as "createdAt"
    FROM chat_histories
    WHERE conversation_id = ${conversationID}
  `;

  return result[0] ? (result[0] as Conversation) : { messages: [], ownerID: "" };
};

/**
 * The conversation metadata without the messages.
 */
export type ConversationData = Omit<SaveAIState, 'messages'>;

export const list = async ({ ownerID }: { ownerID: string }): Promise<ConversationData[]> => {
  const r = await sql`
    SELECT conversation_id,
           user_id,
          updated_at,
          created_at
    FROM chat_histories
    WHERE user_id = ${ownerID}
    ORDER BY created_at DESC
    LIMIT 20
  `;

  return r.map(c => ({
    conversationID: c.conversation_id,
    userID: c.user_id,
    updatedAt: c.updated_at,
    createdAt: c.created_at,
  }));
};
