import { Conversation, ServerMessage } from "@/llm/types";

import { sql } from "./sql";

export type SaveAIState = {
  conversationID: string;
  userID: string;
  messages: ServerMessage[];
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
};

export const get = async ({ conversationID }: { conversationID: string }): Promise<Conversation> => {
  const result = await sql`
    SELECT messages, user_id as "ownerID"
    FROM chat_histories
    WHERE conversation_id = ${conversationID}
  `;

  return result[0] ? (result[0] as Conversation) : { messages: [], ownerID: "" };
};
