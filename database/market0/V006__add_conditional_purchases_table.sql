CREATE TABLE "conditional_purchases"(
  "id" bigserial PRIMARY KEY,
  "user_id" text NOT NULL,
  "symbol" text NOT NULL,
  "quantity" integer NOT NULL,
  "metric" text NOT NULL,
  "operator" text NOT NULL,
  "threshold" DECIMAL(10, 2) NOT NULL,
  "status" text NOT NULL,
  "link" text,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON "conditional_purchases"(user_id);

-- create a trigger to modify updated_at on every update:
CREATE OR REPLACE FUNCTION update_conditional_purchases_updated_at()
  RETURNS TRIGGER
  AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;
