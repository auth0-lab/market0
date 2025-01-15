"use client";

import { useState } from "react";

import { CheckGreenIcon } from "@/components/icons";
import Loader from "@/components/loader";
import { EnsureAPIAccess } from "@/sdk/components/ensure-api-access";

import { Event } from "../../actions/calendar-events";

export function CalendarEvents({
  events,
  addEvents,
}: {
  events: Event[];
  addEvents: (events: Event[]) => Promise<any>;
}) {
  const [working, setWorking] = useState(false);
  const [finished, setFinished] = useState(false);

  return (
    <div className="flex gap-3 flex-row items-center mt-2">
      <EnsureAPIAccess
        provider={{
          name: "google",
          api: "google-calendar",
          requiredScopes: ["https://www.googleapis.com/auth/calendar.events"],
        }}
        connectWidget={{
          title: "Connect to Google Calendar",
          description: "To add events to your calendar, you’ll first need to connect to your Google Account.",
        }}
        shouldCheckAuthorization={true}
      >
        <div className="border border-gray-300 rounded-lg p-6 flex items-center w-full justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-base leading-6 font-semibold">Add Events to my Calendar</h2>
            <p className="text-sm leading-5 font-light text-gray-500">
              All events will be added to your Google Calendar.
            </p>
          </div>
          <div>
            {finished && !working && <CheckGreenIcon />}

            {!finished && (
              <button
                disabled={working || finished}
                onClick={async () => {
                  setWorking(true);
                  await addEvents(events);
                  setWorking(false);
                  setFinished(true);
                }}
                className="flex gap-2 items-center bg-gray-200 text-black whitespace-nowrap rounded-md text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 hover:text-white py-2 px-4"
              >
                Add Events
                {working && (
                  <div className="mr-2">
                    <Loader />
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </EnsureAPIAccess>
    </div>
  );
}
