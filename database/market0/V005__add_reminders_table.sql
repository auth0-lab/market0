CREATE TABLE "reminders"(
  "id" bigserial PRIMARY KEY,
  "user_id" text NOT NULL,
  "title" text NOT NULL,
  "due" timestamp NOT NULL,
  "notes" text,
  "link" text,
  "google_task_id" text,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON "reminders"(user_id);

-- create a trigger to modify updated_at on every update:
CREATE OR REPLACE FUNCTION update_reminders_updated_at()
  RETURNS TRIGGER
  AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

