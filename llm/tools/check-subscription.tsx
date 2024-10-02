import { z } from "zod";

import Loader from "@/components/loader";
import { defineTool } from "@/llm/ai-helpers";

import stocks from "../../lib/market/stocks.json";
import { checkEnrollment } from "../actions/newsletter";
import { withTextGeneration } from "../with-text-generation";

export default defineTool("check_subscription", async () => {
  return {
    description: `Check if the user is subscribed to the newsletter`,
    parameters: z.object({
    }),
    generate: withTextGeneration({}, async function* () {
      yield <Loader />;
      const isUserEnrolled = await checkEnrollment({ symbol: stocks[0].symbol });
      if (isUserEnrolled) {
        return 'You are subscribed to the newsletter';
      } else {
        return 'You are not subscribed to the newsletter';
      }
    }),
  };
});
