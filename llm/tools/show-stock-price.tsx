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
    }),
    generate: async function* ({ symbol }) {
      yield <StockSkeleton />;

      const doc = await getStockPrices({ symbol });

      if (!doc) {
        history.update(`[Price not found for ${symbol}]`);
        return <>Price not found</>;
      }

      const { delta, current_price: price } = doc;

      const params = {
        symbol,
        price,
        delta,
        company: doc.shortname,
        currency: 'USD',
        market: doc.exchange,
      };

      history.update({
        role: "assistant",
        content: `[Price of ${symbol} = ${price}]`,
        componentName: serialization.names.get(Stock)!,
        params,
      });

      return (
        <Stock
          {...params}
        />
      );
    },
  };
});
