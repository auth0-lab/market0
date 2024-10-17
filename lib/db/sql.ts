import postgres from "postgres";

import { neon } from "@neondatabase/serverless";

const queryDebugger = (connection: number, query: string, parameters: any[], paramTypes: any[]) => {
  console.log('postgres:', { connection, query, parameters, paramTypes });
};

export const sql: ReturnType<typeof postgres> = process.env.USE_NEON
  ? (neon(process.env.DATABASE_URL as string) as unknown as ReturnType<
    typeof postgres
  >)
  : postgres({
    connection: {
      TimeZone: process.env.PGTZ ?? "UTC",
    },
    debug: process.env.DEBUG_QUERIES ? queryDebugger : undefined,
  });
