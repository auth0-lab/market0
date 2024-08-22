"use server";

import { getByID, Reminder, update } from "@/lib/db/reminders";
import { withGoogleApi } from "@/sdk/auth0/3rd-party-apis/providers/google";
import { getUser } from "@/sdk/fga";

/**
 * Create the reminder in google tasks.
 *
 * @param reminder - The reminder to create.
 * @returns
 */
export async function createGoogleTask(reminder: Reminder) {
  return withGoogleApi(async function (accessToken: string) {
    const reminderFromDB = await getByID(reminder.user_id, reminder.id);
    if (reminderFromDB && reminderFromDB.google_task_id) {
      return reminderFromDB;
    }
    const url = 'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks';

    const res = await fetch(
      url,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: reminder.title,
          due: reminder.due.toISOString(),
          notes: reminder.notes,
          links: reminder.link ? [
            {
              type: "email",
              description: "Conversation link",
              link: reminder.link
            }
          ] : undefined
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Error creating event: ${await res.text()}`);
    }

    const response = await res.json();

    console.log(`reminders created ${JSON.stringify(response)}`);
    return await update(reminder.id, { google_task_id: response.id });
  })
}

export async function getReminderById(reminderId: string): Promise<Reminder | null> {
  'use server';
  const user = await getUser();
  const reminder = await getByID(user.sub, reminderId);
  if (!reminder) { return null; }
  return reminder;
}
