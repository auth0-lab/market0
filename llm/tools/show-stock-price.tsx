import { z } from "zod";

import { getStockPrices } from "@/lib/market/stocks";
import { defineTool } from "@/llm/ai-helpers";
import * as serialization from "@/llm/components/serialization";
import { Stock } from "@/llm/components/stock";
import { StockSkeleton } from "@/llm/components/stock-skeleton";
import { getHistory } from "@/llm/utils";

export default defineTool("show_stock_price", () => {
  const history = getHistory();

  return {
    description:
      "Get the market price of a given stock or currency. Use this to show the price of a publicly traded stock to the user.",
    parameters: z.object({
      symbol: z
        .string()
        .describe(
          "The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD."
        ),
      market: z
        .string()
        .describe("The market of the stock or currency. e.g. ITMX/CSB."),
      company: z.string().describe("The company name of the stock."),
      currency: z.string().describe("The currency of the stock."),
    }),
    generate: async function* ({ symbol, market, company, currency }) {
      yield <StockSkeleton />;

      const doc = await getStockPrices({ symbol });

      if (!doc) {
        history.update(`[Price not found for ${symbol}]`);
        return <>Price not found</>;
      }

      const { delta, current_price: price } = doc;

      history.update({
        role: "assistant",
        content: `[Price of ${symbol} = ${price}]`,
        componentName: serialization.names.get(Stock)!,
        params: { symbol, price, delta, company, currency, market },
      });

      return (
        <Stock
          symbol={symbol}
          price={price}
          delta={delta}
          market={market}
          currency={currency}
          company={company}
        />
      );
    },
  };
});
