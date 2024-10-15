import { headers } from "next/headers";
import { z } from "zod";

import Loader from "@/components/loader";
import { RELATION } from "@/lib/constants";
import { conditionalPurchases } from "@/lib/db";
import { defineTool } from "@/llm/ai-helpers";
import * as serialization from "@/llm/components/serialization";
import { ConditionalPurchase } from "@/llm/components/stocks";
import { getHistory } from "@/llm/utils";
import { isGuardianEnrolled } from "@/sdk/auth0/mgmt";
import { getUser, withFGA } from "@/sdk/fga";
import { withCheckPermission } from "@/sdk/fga/vercel-ai/with-check-permission";

type ToolParams = {
  symbol: string;
  quantity: number;
  metric: string;
  operator: string;
  threshold: number;
};

/**
 * This tool enables users to place conditional stock purchase orders based on a financial metric.
 *
 * **Inputs:**
 * - **Stock Symbol**: The ticker symbol of the stock the user wants to purchase.
 * - **Quantity**: The number of shares the user wants to buy.
 * - **Financial Metric**: A metric (e.g., price-to-earnings ratio, stock price, etc.) specified by the user in natural language to define the purchase condition.
 *
 * **Functionality:**
 * - The user's conditional purchase request is stored in the database, waiting for the specified financial metric to meet the condition.
 * - When the condition is satisfied, the system triggers a purchase order, pending user confirmation via Multi-Factor Authentication (MFA).
 *
 * **Workflow:**
 * 1. User specifies the stock symbol, the number of shares, and a financial metric to monitor.
 * 2. The request is saved in the database for monitoring.
 * 3. When the metric meets the condition, the system prompts the user with an MFA confirmation before completing the purchase.
 *
 * **Note:** The tool only executes the purchase after user confirmation through MFA to ensure security.
 */
export default defineTool("add_conditional_purchase", () => {
  const history = getHistory();

  return {
    description: `Buy a specified number of shares of a stock when a given financial metric meets a condition, using either natural language or symbolic expressions.
      The operator might be specified using natural language, but you will need to convert it to one of the allowed values (e.g., 'greater than' would map to '>').
      If specified financial metric is not supported or you need more information, explain it.
      Don't assume the number of shares.
      For example:
        1. 'Buy 10 shares of ZEKO when its P/E ratio is greater than 0' would map to {symbol: 'ZEKO', quantity: 10, metric: 'P/E', operator: '>', threshold: 0}.
        2. 'Buy 10 shares of ZEKO but only when its P/E > 0' would map to the same inputs.
        3. 'Buy 100 shares of Tesla when its price is less than or equal to $1000' maps to {symbol: 'TSLA', quantity: 100, metric: 'price', operator: '<=', threshold: 1000}.`,
    parameters: z.object({
      symbol: z.string().describe("The name or ticker symbol of the stock (e.g., 'Zeko Technologies' or ZEKO)."),
      quantity: z.number().describe("Number of shares to buy."),
      metric: z.enum(["P/E", "EPS", "P/B", "D/E", "ROE", "RSI", "price"]).describe("The financial metric to monitor."),
      operator: z.enum(["=", "<", "<=", ">", ">="]).describe("The comparison operator to evaluate the condition."),
      threshold: z.number().describe("The threshold value of the financial variable that triggers the buy action."),
    }),
    generate: withCheckPermission<ToolParams>(
      {
        checker: (toolParams) =>
          withFGA({
            object: `asset:${toolParams.symbol.toLowerCase()}`,
            relation: RELATION.CAN_BUY_STOCKS,
            context: { current_time: new Date().toISOString() },
          }),
      },
      async function* ({ symbol, quantity, metric, operator, threshold }) {
        yield <Loader />;

        const user = await getUser();
        const hs = headers();
        const isEnrolled = await isGuardianEnrolled();

        // Store the conditional purchase in Market0 db
        let conditionalPurchase = await conditionalPurchases.create({
          user_id: user.sub,
          symbol,
          quantity,
          metric,
          operator,
          threshold,
          status: "pending",
          link: hs.get("referer") ?? undefined,
        });

        history.update({
          role: "assistant",
          content: `Noted. I will proceed with the purchase of ${quantity} shares of $${symbol} once its ${metric} ${operator} ${threshold}`,
          componentName: serialization.names.get(ConditionalPurchase)!,
          params: { id: conditionalPurchase.id },
        });

        return <ConditionalPurchase id={conditionalPurchase.id} isMFAEnrolled={isEnrolled} />;
      }
    ),
  };
});
