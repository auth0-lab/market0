"use server";

import { withGoogleApi } from "@/sdk/auth0/3rd-party-apis/providers/google";

export type Event = {
  headline: string;
  description: string;
  date: string;
};

export async function addEventsToCalendar(events: Event[]) {
  return withGoogleApi(async function (accessToken: string) {
    return await Promise.all(
      events.map(async (event: Event) => {
        // https://developers.google.com/calendar/api/v3/reference/events/insert
        const res = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              summary: event.headline,
              description: event.description,
              start: {
                date: event.date,
                timeZone: "UTC",
              },
              end: {
                date: event.date,
                timeZone: "UTC",
              },
              reminders: {
                useDefault: true,
              },
            }),
          }
        );

        if (!res.ok) {
          throw new Error(`Error creating event: ${await res.text()}`);
        }

        const { summary: headline, htmlLink } = await res.json();
        return { headline, htmlLink };
      })
    );
  });
}
