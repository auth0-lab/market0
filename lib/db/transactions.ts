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

export const create = async (
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
  const result = await sql<Position[]> `
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
