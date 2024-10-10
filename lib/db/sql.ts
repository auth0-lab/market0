import postgres from "postgres";

import { neon } from "@neondatabase/serverless";

export const sql: ReturnType<typeof postgres> = process.env.USE_NEON
  ? (neon(process.env.DATABASE_URL as string) as unknown as ReturnType<
    typeof postgres
  >)
  : postgres({
    connection: {
      TimeZone: process.env.PGTZ
    }
  });
