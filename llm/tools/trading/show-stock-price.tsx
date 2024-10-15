import { z } from "zod";

import { getStockPrices } from "@/lib/market/stocks";
import { defineTool } from "@/llm/ai-helpers";
import * as serialization from "@/llm/components/serialization";
import { Stock, StockSkeleton } from "@/llm/components/stocks";
import { getHistory } from "@/llm/utils";

/**
 * This tool allow the user to check the price of a stock.
 */
export default defineTool("show_stock_price", () => {
  const history = getHistory();

  return {
    description: "Check price of an stock. Prefer this when there is not clear intention of buying.",
    parameters: z.object({
      symbol: z.string().describe("The name or symbol of the stock. e.g. DOGE/AAPL/USD."),
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
        currency: "USD",
        market: doc.exchange,
      };

      history.update({
        role: "assistant",
        content: `[Price of ${symbol} = ${price}]`,
        componentName: serialization.names.get(Stock)!,
        params,
      });

      return <Stock {...params} />;
    },
  };
});
