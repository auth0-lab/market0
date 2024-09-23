import { z } from "zod";

import { defineTool } from "@/llm/ai-helpers";
import * as serialization from "@/llm/components/serialization";
import { Stocks } from "@/llm/components/stocks";
import { StocksSkeleton } from "@/llm/components/stocks-skeleton";
import { getHistory } from "@/llm/utils";

export default defineTool("list_stocks", () => {
  const history = getHistory();

  return {
    description:
      "List three imaginary stocks that are trending. Always list ATKO.",
    parameters: z.object({
      stocks: z.array(
        z.object({
          symbol: z.string().describe("The symbol of the stock"),
          price: z.number().describe("The price of the stock"),
          delta: z.number().describe("The change in price of the stock"),
          market: z
            .string()
            .describe(
              "The market of the stock or currency. e.g. ITMX/CSB. This is provided by the model."
            ),
          company: z
            .string()
            .describe(
              "The company name of the stock. This is provided by the model."
            ),
          currency: z
            .string()
            .describe(
              "The currency of the stock. This is provided by the model."
            ),
        })
      ),
    }),
    generate: async function* ({ stocks }) {
      yield <StocksSkeleton />;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      history.update({
        role: "assistant",
        componentName: serialization.names.get(Stocks),
        params: { stocks },
        content: `[Listed stocks: JSON.stringify({ stocks })]`,
      });

      return <Stocks stocks={stocks} />;
    },
  };
});
