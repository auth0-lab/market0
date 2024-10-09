import { headers } from "next/headers";
import { z } from "zod";

import Loader from "@/components/loader";
import { reminders } from "@/lib/db";
import { defineTool } from "@/llm/ai-helpers";
import { Reminder } from "@/llm/components/reminder";
import * as serialization from "@/llm/components/serialization";
import { getHistory } from "@/llm/utils";
import { getUser } from "@/sdk/fga";

export default defineTool("add_reminder", async () => {
  const history = getHistory();

  return {
    description: `Add a reminder to the current user's calendar`,
    parameters: z.object({
      due: z
        .string()
        .describe("The due date of the reminder, in ISO-8601 format"),
      title: z.string().describe("The title of the reminder"),
    }),
    generate: async function* ({ due, title }: { due: string; title: string }) {
      yield <Loader />;

      const user = await getUser();
      const hs = headers();

      //Store the reminder in Market0 db
      let reminder = await reminders.create({
        due: new Date(due),
        title,
        user_id: user.sub,
        notes: `Created from Market0`,
        link: hs.get("referer") ?? undefined,
      });

      history.update({
        role: "assistant",
        content: `Added reminder to Google Tasks`,
        componentName: serialization.names.get(Reminder)!,
        params: { reminderID: reminder.id },
      });

      return <Reminder reminderID={reminder.id} />;
    },
  };
});
