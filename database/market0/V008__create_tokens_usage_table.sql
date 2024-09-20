-- Create token_usage table
CREATE TABLE token_usage(
  "id" serial PRIMARY KEY,
  "user_id" text NOT NULL,
  "timestamp" timestamptz NOT NULL DEFAULT NOW(),
  "tokens_used" int NOT NULL
);

-- Create an index on timestamp for efficient querying
CREATE INDEX idx_token_usage_timestamp ON token_usage(timestamp);

