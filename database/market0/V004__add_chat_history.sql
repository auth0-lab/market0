CREATE TABLE chat_histories (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  messages jsonb NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX chat_histories_conversation_id_index ON chat_histories(user_id, conversation_id);
