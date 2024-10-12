import { z } from "zod";

import { defineTool } from "@/llm/ai-helpers";
import { Events } from "@/llm/components/events";
import { EventsSkeleton } from "@/llm/components/events-skeleton";
import * as serialization from "@/llm/components/serialization";
import { getHistory } from "@/llm/utils";

export default defineTool("get_events", () => {
  const history = getHistory();

  return {
    description: `List at most 3 funny imaginary events between user highlighted dates that describe stock activity. Make sure events dates are after the start date "${new Date().toLocaleDateString(
      "en-CA"
    )}"`,
    parameters: z.object({
      events: z.array(
        z.object({
          date: z.string().describe("The date of the event, in ISO-8601 format"),
          startDate: z.string().describe("The start time of the event"),
          endDate: z.string().describe("The end time of the event no more that 2 hours after the start time"),
          headline: z.string().describe("The headline of the event"),
          description: z.string().describe("The description of the event"),
        })
      ),
    }),
    generate: async function* ({ events }) {
      yield <EventsSkeleton />;

      history.update({
        role: "assistant",
        componentName: serialization.names.get(Events)!,
        // intentionally avoid
        params: { events },
        content: `[Listed events: ${JSON.stringify({ events })}]`,
      });

      return <Events events={events} />;
    },
  };
});
