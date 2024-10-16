-- Rename the table
ALTER TABLE chat_histories RENAME TO conversations;

-- Drop the unique index
DROP INDEX IF EXISTS chat_histories_conversation_id_index;

-- Drop the primary key constraint and the id column
ALTER TABLE conversations
  DROP CONSTRAINT chat_histories_pkey;

ALTER TABLE conversations
  DROP COLUMN id;

-- Rename conversation_id to id
ALTER TABLE conversations RENAME COLUMN conversation_id TO id;

-- Rename user_id to owner_id
ALTER TABLE conversations RENAME COLUMN user_id TO owner_id;

-- Add the primary key on id only
ALTER TABLE conversations
  ADD PRIMARY KEY (id);

