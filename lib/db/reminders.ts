import { sql } from "./sql";

export type Reminder = {
  id: string;
  user_id: string;
  title: string;
  due: Date;
  notes: string;
  link?: string;
  google_task_id?: string;
  created_at: Date;
  updated_at: Date;
};

type CreateReminderParams = {
  user_id: string;
  title: string;
  due: Date;
  notes: string;
  link?: string;
  google_task_id?: string;
};

const mapReminderFromDB = (reminder: any): Reminder => ({
  ...reminder,
  due: new Date(reminder.due),
  created_at: new Date(reminder.created_at),
  updated_at: new Date(reminder.updated_at),
});

export const create = async ({
  user_id,
  title,
  due,
  notes,
  google_task_id,
  link
}: CreateReminderParams): Promise<Reminder> => {
  const result = await sql`
    INSERT INTO reminders (user_id, title, due, notes, google_task_id, link)
    VALUES (${user_id}, ${title}, ${due}, ${notes}, ${google_task_id ?? null}, ${link ?? null})
    RETURNING *
  `;

  return mapReminderFromDB(result[0]);
};

export const update = async (
  id: string,
  params: Omit<Partial<Reminder>, "id" | "user_id" | "created_at" | "updated_at">
) => {
  // ${sql(params, "title", "due", "notes", "google_task_id", "link")}

  const result = await sql`
    UPDATE reminders
    SET title = COALESCE(${params.title ?? null}, title),
        due = COALESCE(${params.due ?? null}, due),
        notes = COALESCE(${params.notes ?? null}, notes),
        google_task_id = COALESCE(${params.google_task_id ?? null}, google_task_id),
        link = COALESCE(${params.link ?? null}, link)
    WHERE id = ${id}
    RETURNING *
  `;

  return result.length > 0 ? mapReminderFromDB(result[0]) : null;
}

export const getByID = async (user_id: string, id: string): Promise<Reminder | null> => {
  const result = await sql`
    SELECT * FROM reminders
    WHERE user_id = ${user_id} AND id = ${id}
  `;

  return result.length > 0 ? mapReminderFromDB(result[0]) : null;
}
