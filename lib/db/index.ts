import { Conversation, ServerMessage } from "@/llm/types";

import { sql } from "./sql";

type Transaction = {
  id: number;
  ticker_id: string;
  type: "buy" | "sell";
  price: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
};

export const createTransaction = async (
  ticker_id: string,
  price: number,
  quantity: number,
  type: "buy" | "sell",
  user_id: string
): Promise<Transaction> => {
  const result = await sql`
    INSERT INTO transactions (ticker_id, price, quantity, type, user_id)
    VALUES (${ticker_id}, ${price}, ${quantity}, ${type}, ${user_id})
    RETURNING *
  `;

  return result[0] as Transaction;
};

export type Position = {
  ticker_id: string;
  quantity: number;
  av_price: number;
};

export const getPositions = async (user_id: string): Promise<Position[]> => {
  const result = await sql<Position[]>`
    SELECT
        ticker_id,
        SUM(CASE WHEN type = 'buy' THEN quantity ELSE -quantity END) as quantity,
        AVG(CASE WHEN type = 'buy' THEN price END) as av_price
    FROM transactions
    WHERE user_id = ${user_id}
    GROUP BY ticker_id
    HAVING SUM(CASE WHEN type = 'buy' THEN quantity ELSE -quantity END) > 0
  `;

  return result as unknown as Position[];
};

export const deleteDocuments = async (docType: "earning" | "forecast"): Promise<void> => {
  await sql`
    DELETE FROM documents
    WHERE metadata->>'type' = ${docType}
  `;
};

export type SaveAIState = {
  conversationID: string;
  userID: string;
  messages: ServerMessage[];
};

export const saveAIStateToStore = async ({ conversationID, userID, messages }: SaveAIState): Promise<void> => {
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

export const getAIStateFromStore = async ({ conversationID }: { conversationID: string }): Promise<Conversation> => {
  const result = await sql`
    SELECT messages, user_id as ownerID
    FROM chat_histories
    WHERE conversation_id = ${conversationID}
  `;

  return result[0] ? (result[0] as Conversation) : { messages: [], ownerID: "" };
};

export * as reminders from "./reminders";
export * as conditionalPurchases from "./conditional-purchases";
export * as userUsage from "./userUsage";
export * as documents from "./documents";
export * as chatUsers from "./chat-users";
