"use client";

import { format, parseISO } from "date-fns";
import { useState } from "react";

import { GoogleCalendarIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { EnsureAPIAccess } from "@/sdk/components/ensure-api-access";

import { Event, EventAvailability } from "../actions/calendar-events";
import { NotAvailableReadOnly } from "./not-available-read-only";

export function CalendarEvents({
  events,
  checkAvailability,
  readOnly = false,
}: {
  events: Event[];
  checkAvailability: (events: Event[]) => Promise<any>;
  readOnly?: boolean;
}) {
  const [availability, setAvailability] = useState([]);

  async function onUserAuthorized() {
    const availability = await checkAvailability(events);

    setAvailability(
      availability.sort((a: EventAvailability, b: EventAvailability) => {
        a.date.localeCompare(b.date);
      })
    );
  }

  function getCalendarLink(event: Event) {
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${event.headline}&details=${
      event.description
    }&dates=${format(parseISO(event.startDate), "yyyyMMdd'T'HHmmss")}/${format(
      parseISO(event.endDate),
      "yyyyMMdd'T'HHmmss"
    )}`;
  }

  if (readOnly) {
    return <NotAvailableReadOnly />;
  }

  return (
    <div className="flex gap-3 flex-row items-center mt-2">
      <EnsureAPIAccess
        provider={{
          name: "google",
          api: "google-calendar",
          requiredScopes: ["https://www.googleapis.com/auth/calendar.freebusy"],
        }}
        connectWidget={{
          icon: (
            <div className="bg-gray-200 p-3 rounded-lg flex-wrap">
              <GoogleCalendarIcon />
            </div>
          ),
          title: "Check your availability in Google Calendar",
          description:
            "This will only check free/busy availability, not get full calendar acces . This showcases the Google Calendar API integration, while minimizing information disclosure necessary for a demo app.",
          action: { label: "Check" },
        }}
        shouldCheckAuthorization={true}
        readOnly={readOnly}
        onUserAuthorized={onUserAuthorized}
      >
        <div className="border border-gray-300 rounded-lg p-6 flex flex-col gap-8 items-left w-full justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-base leading-6 font-semibold">Events available</h2>
            <p className="text-sm leading-5 font-light text-gray-500">
              See which events you can add to your calendar based on your availability.
            </p>
          </div>
          <div>
            <ul className="flex flex-col">
              {availability.map((event: EventAvailability) => (
                <li
                  key={event.date}
                  className="flex gap-5 sm:gap-10 justify-between border-t border-gray-300 pt-4 pb-4 flex-col sm:flex-row"
                >
                  <div className="flex flex-col gap-2">
                    <div className={cn("text-sm font-medium text-gray-800", !event.slotAvailable && "line-through")}>
                      {event.headline}
                    </div>
                    <div className={cn("text-xs font-light text-gray-500", !event.slotAvailable && "line-through")}>
                      {format(parseISO(event.date), "MMMM dd, yyyy")} from {format(parseISO(event.startDate), "hh a ")}{" "}
                      to {format(parseISO(event.endDate), "hh a ")}
                    </div>
                  </div>
                  <div className="flex justify-center sm:justify-end items-center min-w-60">
                    {event.slotAvailable && (
                      <a
                        href={getCalendarLink(event)}
                        target="_blank"
                        rel="noopener noreferer"
                        className="text-sm font-medium text-blue-600"
                      >
                        Add to my calendar
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </EnsureAPIAccess>
    </div>
  );
}
