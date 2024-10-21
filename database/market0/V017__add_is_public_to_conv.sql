/* This columns is only used to prevent the deletion of chats. */
ALTER TABLE conversations
  ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE;
