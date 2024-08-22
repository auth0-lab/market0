"use client";

import { format, parseISO } from "date-fns";

import { addEventsToCalendar } from "../actions/calendar-events";
import { CalendarEvents } from "./calendar-events";
import WarningWrapper from "./warning-wrapper";

interface Event {
  date: string;
  headline: string;
  description: string;
}

export function Events({ events }: { events: Event[] }) {
  return (
    <div className="flex flex-col gap-4">
      <WarningWrapper>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-2 overflow-scroll pb-4">
            {events.map((event) => (
              <div
                key={event.date}
                className="flex flex-col p-9 bg-zinc-900 rounded-2xl flex-shrink-0 max-w-80"
              >
                <div className="border-b border-gray-500 pb-6 mb-6 flex flex-col gap-2">
                  <div className="text-zinc-400 text-sm">
                    {format(parseISO(event.date), "dd LLL, yyyy")}
                  </div>
                  <div className="text-xl text-white">
                    {event.headline.slice(0, 30)}
                  </div>
                </div>
                <div className="text-white/80 text-sm font-light tracking-wide">
                  {event.description.slice(0, 70)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      </WarningWrapper>

      <CalendarEvents events={events} addEvents={addEventsToCalendar} />
    </div>
  );
}
