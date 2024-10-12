"use client";

import { format, parseISO } from "date-fns";

import { checkAvailabilityForEvents } from "../actions/calendar-events";
import { CalendarEvents } from "./calendar-events";
import WarningWrapper from "./warning-wrapper";

interface Event {
  date: string;
  startDate: string;
  endDate: string;
  headline: string;
  description: string;
}

export function Events({ events, readOnly = false }: { events: Event[]; readOnly?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <WarningWrapper readOnly={readOnly}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3">
            {events.map((event) => (
              <div key={event.date} className="flex flex-col p-4 sm:p-6 bg-zinc-900 rounded-2xl">
                <div className="border-b border-[#535257] pb-2 sm:pb-4 mb-2 sm:mb-4 flex flex-col gap-3">
                  <div className="text-zinc-500 text-xs font-medium">
                    {format(parseISO(event.date), "dd LLL, yyyy")}
                  </div>
                  <div className="text-base sm:text-xl text-white font-semibold leading-6">
                    {event.headline.slice(0, 30)}
                  </div>
                </div>
                <div className="text-white/80 text-xs font-light tracking-wide">
                  {event.description.slice(0, 70)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      </WarningWrapper>

      <CalendarEvents events={events} checkAvailability={checkAvailabilityForEvents} readOnly={readOnly} />
    </div>
  );
}
