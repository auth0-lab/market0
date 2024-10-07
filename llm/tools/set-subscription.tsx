import { z } from "zod";

import Loader from "@/components/loader";
import { defineTool } from "@/llm/ai-helpers";

import stocks from "../../lib/market/stocks.json";
import { checkEnrollment, enrollToNewsletter, unenrollFromNewsletter } from "../actions/newsletter";
import { withTextGeneration } from "../with-text-generation";

export default defineTool("set_subscription", async () => {
  return {
    description: `Allows the user to subscribe or unsubscribe to newsletter.
    `,
    parameters: z.object({
      action: z.enum(['subscribe', 'unsubscribe'])
    }),
    generate: withTextGeneration({}, async function* ({ action }: { action: 'subscribe' | 'unsubscribe' }) {
      yield <Loader />;

      const isUserEnrolled = await checkEnrollment({ symbol: stocks[0].symbol });
      if (action === 'subscribe') {
        if (isUserEnrolled) {
          return 'You are already subscribed to newsletter.';
        }
        await enrollToNewsletter();
        return `The user has successfully subscribed to the newsletter.
        Be sure to thank them for subscribing.
        Optionally, offer them a forecast analysis.
      `;
      } else {
        if (!isUserEnrolled) {
          return 'You are not subscribed to newsletter.';
        }
        await unenrollFromNewsletter();
      }
      return 'Subscription updated successfully.';
    }),
  };
});
