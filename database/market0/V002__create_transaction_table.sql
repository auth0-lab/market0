CREATE TYPE transaction_type AS ENUM ('buy', 'sell');

CREATE TABLE transactions (
  "id" bigserial PRIMARY KEY,
  "ticker_id" text NOT NULL,
  "type" VARCHAR(4) CHECK (TYPE IN ('buy', 'sell')),
  "quantity" INTEGER NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);
