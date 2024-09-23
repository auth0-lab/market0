import { z } from "zod";

import { defineTool } from "@/llm/ai-helpers";
import * as serialization from "@/llm/components/serialization";
import { Stocks } from "@/llm/components/stocks";
import { StocksSkeleton } from "@/llm/components/stocks-skeleton";
import { getHistory } from "@/llm/utils";

import allStocks from "../../lib/market/stocks.json";

export default defineTool("list_stocks", () => {
  const history = getHistory();

  return {
    description:
      "List stocks, always list ATKO.",
    parameters: z.object({
      tickers: z.array(
        z.string().describe("The symbol or ticker of the stock")
      )
    }),
    generate: async function* ({ tickers }) {
      yield <StocksSkeleton />;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const stocks = tickers.map((ticker) => {
        const stock = allStocks.find((stock) => stock.symbol === ticker);
        return {
          symbol: stock?.symbol,
          price: stock?.current_price,
          delta: stock?.delta,
          market: stock?.exchange,
          company: stock?.shortname,
          currency: 'USD',
        }
      });

      history.update({
        role: "assistant",
        componentName: serialization.names.get(Stocks),
        params: { stocks },
        content: `[Listed stocks: ${JSON.stringify({ stocks })}]`,
      });

      return <Stocks stocks={stocks} />;
    },
  };
});
