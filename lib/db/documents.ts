import { getUser } from "@/sdk/fga";

import { sql } from "./sql";

type Document = {
  id: number;
  metadata: {
    id: string;
    title: string;
    symbol: string;
    link: string;
    type: 'earning' | 'forecast';
  };
  content: string;
};

export const getLatestEarningReport = async (symbol: string) => {
  const res = await sql<Document[]>`
    SELECT *
    FROM documents
    WHERE metadata->>'type' = 'earning'
      AND metadata->>'symbol' = ${symbol}
    ORDER BY id DESC LIMIT 1
  `;
  return res[0];
};

export const query = async (type?: 'earning' | 'forecast', symbol?: string): Promise<Document[]> => {
  const res = await sql<Document[]>`
    SELECT *
    FROM documents
    WHERE (metadata->>'type' = ${type ?? null} OR ${type == null})
      AND (metadata->>'symbol' = ${symbol ?? null} OR ${symbol == null})
  `;
  return res;
};

export const getByID = async (id: string): Promise<Document> => {
  const res = await sql<Document[]>`
    SELECT *
    FROM documents
    WHERE metadata->>'id' = ${id}
  `;
  return res[0];
};
