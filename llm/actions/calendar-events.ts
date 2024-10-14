"use server";

import { withGoogleApi } from "@/sdk/auth0/3rd-party-apis/providers/google";

export type Event = {
  headline: string;
  description: string;
  date: string;
  startDate: string;
  endDate: string;
};

export type EventAvailability = Event & { slotAvailable: boolean };

async function checkAvailability(accessToken: string, event: Event) {
  const url = "https://www.googleapis.com/calendar/v3/freeBusy";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: event.startDate,
      timeMax: event.endDate,
      timeZone: "UTC",
      items: [{ id: "primary" }],
    }),
  });

  if (!response.ok) {
    return { ...event, slotAvailable: false };
  }

  const data = await response.json();
  const busy = data.calendars.primary.busy;
  const eventMeta = { ...event, slotAvailable: busy.length === 0 };

  return eventMeta;
}

export async function checkAvailabilityForEvents(events: Event[]) {
  return withGoogleApi(async function (accessToken: string) {
    return await Promise.all(
      events.map(async (event: Event) => {
        return checkAvailability(accessToken, event);
      })
    );
  });
}

export async function addEventsToCalendar(events: Event[]) {
  return withGoogleApi(async function (accessToken: string) {
    return await Promise.all(
      events.map(async (event: Event) => {
        // https://developers.google.com/calendar/api/v3/reference/events/insert
        const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
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
        });

        if (!res.ok) {
          throw new Error(`Error creating event: ${await res.text()}`);
        }

        const { summary: headline, htmlLink } = await res.json();
        return { headline, htmlLink };
      })
    );
  });
}
