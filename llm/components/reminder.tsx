"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";

import { ExternalLink } from "@/components/icons";
import Loader from "@/components/loader";
import { Reminder as ReminderType } from "@/lib/db/reminders";
import { createGoogleTask, getReminderById } from "@/llm/actions/reminders";
import { EnsureAPIAccess } from "@/sdk/components/ensure-api-access";

export function Reminder({ reminderID }: { reminderID: string }) {
  const [isWorking, setIsWorking] = useState(true);
  const [reminder, setReminder] = useState<ReminderType | null>(null);

  const shouldCheckAuthorization = useCallback(() => {
    return !!reminder && !reminder.google_task_id;
  }, [reminder]);

  const onUserAuthorized = useCallback(async () => {
    if (reminder && !reminder.google_task_id) {
      setReminder(await createGoogleTask(reminder));
    }
  }, [reminder]);

  useEffect(() => {
    (async () => {
      let reminder = await getReminderById(reminderID);

      if (!reminder) {
        setIsWorking(false);
        return;
      }

      setReminder(reminder);
      setIsWorking(false);
    })();
  }, [reminderID]);

  if (isWorking) {
    return <Loader />;
  }

  return (
    <EnsureAPIAccess
      provider={{
        name: "google",
        requiredScopes: ["https://www.googleapis.com/auth/tasks"],
        api: "google-tasks",
      }}
      connectWidget={{
        title: "Connect to Google Tasks",
        description:
          "To create reminders in Google Tasks, you’ll first need to connect to your Google Account.",
      }}
      shouldCheckAuthorization={shouldCheckAuthorization}
      onUserAuthorized={onUserAuthorized}
    >
      {reminder && (
        <div className="border border-gray-300 rounded-lg p-6 flex items-center w-full justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-base leading-6 font-semibold">
              {reminder.title}
            </h2>
            <p className="text-sm leading-5 font-light text-gray-500">
              Google Task created at {format(reminder.due, "dd LLL, yyyy")}.
            </p>
          </div>
          <div>
            <a
              href="https://tasks.google.com"
              rel="noopener noreferrer"
              target="_blank"
              className="flex gap-2 items-center bg-gray-200 text-black whitespace-nowrap rounded-md text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 hover:text-white py-2 px-4"
            >
              View Task <ExternalLink />
            </a>
          </div>
        </div>
      )}
      {!reminder && <div>Reminder not found</div>}
    </EnsureAPIAccess>
  );
}
