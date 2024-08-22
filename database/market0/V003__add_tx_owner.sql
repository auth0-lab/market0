TRUNCATE TABLE "transactions";

ALTER TABLE
  "transactions"
ADD
  COLUMN "user_id" text NOT NULL;

CREATE INDEX ON "transactions" (user_id);
