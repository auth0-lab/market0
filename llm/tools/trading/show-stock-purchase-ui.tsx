import { generateId } from "ai";
import { z } from "zod";

import { RELATION } from "@/lib/constants";
import { getStockPrices } from "@/lib/market/stocks";
import { defineTool } from "@/llm/ai-helpers";
import * as serialization from "@/llm/components/serialization";
import { StockPurchase } from "@/llm/components/stocks";
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

/**
 * This tool allows users to buy stocks while enforcing access control through Fine-Grained Authorization (FGA).
 *
 * **Purpose:**
 * - This demo illustrates the use of FGA to determine whether a user is authorized to purchase a specific stock, demonstrating stock purchase restrictions based on user roles or attributes.
 *
 * **Authorization Logic:**
 * - FGA is used to impose restrictions, such as preventing users from buying certain stocks if they are insiders or employees of financial institutions.
 *
 * **Examples of Restrictions:**
 * - Users may be restricted from buying a stock if they are employed by a financial institution.
 * - Users who are classified as insiders for a particular stock may be prohibited from purchasing shares of that stock.
 *
 * **Workflow:**
 * 1. The user selects a stock they wish to buy.
 * 2. FGA checks the user’s eligibility based on their attributes (e.g., employment, insider status).
 * 3. If authorized, the user proceeds with the purchase. If not, the purchase is blocked, and an appropriate message is returned.
 */
export default defineTool("show_stock_purchase_ui", () => {
  const history = getHistory();

  return {
    description:
      "Shows the current price of the stock and allow the user to buy it. Prefer this when there is a clear intention of buying a stock.",
    parameters: z.object({
      symbol: z.string().describe("The name or symbol of the stock. e.g. DOGE/AAPL/USD."),
      limit: z.number().optional().describe("The limit price of the order. Optional, defaults to market price."),
      numberOfShares: z
        .number()
        .describe("The **number of shares** for a stock to purchase. Defaults to 100.")
        .default(100),
      market: z.string().describe("The market of the stock. e.g. ITMX/CSB. This is provided by the model."),
      company: z.string().describe("The company name of the stock. This is provided by the model."),
      currency: z.string().describe("The currency of the stock. This is provided by the model."),
    }),
    generate: withCheckPermission<ToolParams>(
      {
        checker: (toolParams) =>
          withFGA({
            object: `asset:${toolParams.symbol.toLowerCase()}`,
            relation: RELATION.CAN_BUY_STOCKS,
            context: { current_time: new Date().toISOString() },
          }),
        onUnauthorized: withTextGeneration(async function* ({ symbol }) {
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
      async function* ({ symbol, limit, market, company, currency, numberOfShares = 10 }) {
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
          market: stockStatus.exchange,
          company: stockStatus.shortname,
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

        return <StockPurchase {...params} />;
      }
    ),
  };
});
