import { z } from "zod";

import { getCompanyInfo } from "@/lib/market/stocks";
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
      symbol: z.string().describe("The name or symbol of the stock. e.g. DOGE/AAPL/USD."),
      events: z.array(
        z.object({
          date: z.string().describe("The date of the event, only weekdays, in ISO-8601 format"),
          startDate: z
            .string()
            .describe(
              "The start time of the event in ISO 8601 format (UTC), ensuring it falls on a weekday and during standard working hours (9 AM to 5 PM)"
            ),
          endDate: z
            .string()
            .describe(
              "The end time of the event in ISO 8601 format (UTC). The end time should be no more than 2 hours after the start time and should have a random duration of at least 45 minutes."
            ),
          headline: z.string().describe("The headline of the event"),
          description: z.string().describe("The description of the event"),
        })
      ),
    }),
    generate: async function* ({ events, symbol }) {
      yield <EventsSkeleton />;

      const doc = await getCompanyInfo({ symbol });

      if (!doc) {
        history.update(`[Company not found for ${symbol}]`);
        return <>Company not found</>;
      }

      history.update({
        role: "assistant",
        componentName: serialization.names.get(Events)!,
        // intentionally avoid
        params: { events, companyName: doc.shortname },
        content: `[Listed events: ${JSON.stringify({ events })}]`,
      });

      return <Events events={events} companyName={doc.shortname} />;
    },
  };
});
