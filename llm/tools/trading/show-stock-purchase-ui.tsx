import { generateId } from "ai";
import { z } from "zod";

import { RELATION } from "@/lib/constants";
import { getStockPrices } from "@/lib/market/stocks";
import { defineTool } from "@/llm/ai-helpers";
import * as serialization from "@/llm/components/serialization";
import { StockPurchase } from "@/llm/components/stock-purchase";
import { getHistory } from "@/llm/utils";
import { withTextGeneration } from "@/llm/with-text-generation";
import { withFGA } from "@/sdk/fga";
import { withCheckPermission } from "@/sdk/fga/vercel-ai/with-check-permission";

type ToolParams = {
  symbol: string;
  limit?: number;
  numberOfShares: number;
  market: string;
  currency: string;
  company: string;
};

export default defineTool("show_stock_purchase_ui", () => {
  const history = getHistory();

  return {
    description:
      "Shows the current price of the stock and allow the user to buy it. Prefer this when there is a clear intention of buying a stock.",
    parameters: z.object({
      symbol: z
        .string()
        .describe(
          "The name or symbol of the stock. e.g. DOGE/AAPL/USD."
        ),
      limit: z
        .number()
        .optional()
        .describe(
          "The limit price of the order. Optional, defaults to market price."
        ),
      numberOfShares: z
        .number()
        .describe(
          "The **number of shares** for a stock to purchase. Defaults to 100."
        )
        .default(100),
      market: z
        .string()
        .describe(
          "The market of the stock. e.g. ITMX/CSB. This is provided by the model."
        ),
      company: z
        .string()
        .describe(
          "The company name of the stock. This is provided by the model."
        ),
      currency: z
        .string()
        .describe("The currency of the stock. This is provided by the model."),
    }),
    generate: withCheckPermission<ToolParams>(
      {
        checker: (toolParams) =>
          withFGA({
            object: `asset:${toolParams.symbol.toLowerCase()}`,
            relation: RELATION.CAN_BUY_STOCKS,
            context: { current_time: new Date().toISOString() },
          }),
        onUnauthorized: withTextGeneration(async function*({ symbol }) {
          return `
The user requesting the operation is not authorized to purchase ${symbol}.
Specific restrictions might apply, such as:
-  working for a financial institution
-  working at ${symbol}.
-  having a specific role in the company.
Please tell the user they should contact the support desk of Market0 to get more information.
`;
        }),
      },
      async function* ({
        symbol,
        limit,
        market,
        company,
        currency,
        numberOfShares = 10,
      }) {
        if (numberOfShares < 10 || numberOfShares > 1000) {
          history.update({
            role: "assistant",
            content: `Invalid amount: ${numberOfShares}`,
          });
          return <>Invalid amount: ${numberOfShares}</>;
        }
        const stockStatus = await getStockPrices({ symbol });
        const price = limit ?? stockStatus.current_price;

        const messageID = generateId();

        const params = {
          messageID,
          symbol,
          price,
          market,
          company,
          currency,
          initialQuantity: numberOfShares,
          delta: stockStatus.delta,
        };

        history.update({
          id: messageID,
          role: "assistant",
          content: `Showing stock purchase UI for ${symbol} at ${price}`,
          componentName: serialization.names.get(StockPurchase)!,
          params,
        });

        return (
          <StockPurchase
            {...params}
          />
        );
      }
    ),
  };
});
