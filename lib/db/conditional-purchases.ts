import { sql } from "./sql";

export type ConditionalPurchaseStatus = "pending" | "completed" | "canceled";

export type ConditionalPurchase = {
  id: string;
  user_id: string;
  status: ConditionalPurchaseStatus;
  symbol: string;
  quantity: number;
  metric: string;
  operator: string;
  threshold: number;
  created_at: Date;
  updated_at: Date;
  link?: string;
};

const mapConditionalPurchaseFromDB = (
  conditionalPurchase: any
): ConditionalPurchase => ({
  ...conditionalPurchase,
  threshold: parseFloat(conditionalPurchase.threshold),
  created_at: new Date(conditionalPurchase.created_at),
  updated_at: new Date(conditionalPurchase.updated_at),
});

export const create = async ({
  user_id,
  symbol,
  quantity,
  metric,
  operator,
  threshold,
  status,
  link,
}: {
  user_id: string;
  symbol: string;
  quantity: number;
  metric: string;
  operator: string;
  threshold: number;
  status: ConditionalPurchaseStatus;
  link?: string;
}): Promise<ConditionalPurchase> => {
  const result = await sql`
    INSERT INTO conditional_purchases (user_id, symbol, quantity, metric, operator, threshold, status, link)
    VALUES (${user_id}, ${symbol.toUpperCase()}, ${quantity}, ${metric.toUpperCase()}, ${operator}, ${threshold}, ${status}, ${
    link ?? null
  })
    RETURNING *
  `;

  return mapConditionalPurchaseFromDB(result[0]);
};

export const update = async (
  id: string,
  params: Omit<
    Partial<ConditionalPurchase>,
    | "id"
    | "user_id"
    | "created_at"
    | "updated_at"
    | "symbol"
    | "quantity"
    | "metric"
    | "operator"
    | "threshold"
  >
) => {
  const result = await sql`
    UPDATE conditional_purchases
    SET status = COALESCE(${params.status ?? null}, status),
        link = COALESCE(${params.link ?? null}, link)
    WHERE id = ${id}
    RETURNING *
  `;

  return result.length > 0 ? mapConditionalPurchaseFromDB(result[0]) : null;
};

export const getByID = async (
  user_id: string,
  id: string
): Promise<ConditionalPurchase | null> => {
  const result = await sql`
    SELECT * FROM conditional_purchases
    WHERE user_id = ${user_id} AND id = ${id}
  `;

  return result.length > 0 ? mapConditionalPurchaseFromDB(result[0]) : null;
};

export const getMatchingPurchases = async (
  symbol: string,
  metric: string,
  value: number,
  user_id?: string
): Promise<ConditionalPurchase[]> => {
  let query = sql`
    SELECT * FROM conditional_purchases
    WHERE symbol = ${symbol.toUpperCase()} AND metric = ${metric.toUpperCase()} AND status = 'pending' AND (
      (operator = '=' AND ${value} = threshold) OR
      (operator = '>' AND ${value} > threshold) OR
      (operator = '>=' AND ${value} >= threshold) OR
      (operator = '<' AND ${value} < threshold) OR
      (operator = '<=' AND ${value} <= threshold)
    )
  `;

  if (user_id) {
    query = sql`${query} AND user_id = ${user_id}`;
  }

  const result = await query;
  return result.map(mapConditionalPurchaseFromDB);
};
