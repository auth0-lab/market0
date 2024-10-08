CREATE TABLE chat_users (
  id BIGSERIAL PRIMARY KEY,
  chat_id TEXT NOT NULL,
  email TEXT NOT NULL,
  user_id TEXT,
  access TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX chat_users_chat_id_email_index ON chat_users(chat_id, email);

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
