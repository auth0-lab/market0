"use server";

import { createStreamableUI, getMutableAIState } from "ai/rsc";

import { RELATION } from "@/lib/constants";
import { createTransaction } from "@/lib/db";
import { runAsyncFnWithoutBlocking } from "@/lib/utils";
import * as serialization from "@/llm/components/serialization";
import { StockPurchase } from "@/llm/components/stock-purchase";
import { StockPurchaseStatus } from "@/llm/components/stock-purchase-status";
import { ServerMessage } from "@/llm/types";
import { getUser, withFGA } from "@/sdk/fga";
import { withCheckPermission } from "@/sdk/fga/next/with-check-permission";

type confirmPurchaseParams = {
  symbol: string,
  price: number,
  quantity: number,

  /**
   * The message ID that triggered the component that called this action.
   */
  messageID: string,
};

const confirmPurchaseInternal = async (
  { symbol, price, quantity, messageID }: confirmPurchaseParams
) => {
  "use server";
  const user = await getUser();
  const history = getMutableAIState();

  const purchasing = createStreamableUI(
    <StockPurchaseStatus message={`Purchasing ${quantity} ${symbol}...`} status="in-progress" />
  );

  runAsyncFnWithoutBlocking(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    purchasing.update(
      <StockPurchaseStatus
        message={`Purchasing ${quantity} ${symbol}... working on it...`}
        status="in-progress" />
    );

    await createTransaction(symbol, price, quantity, "buy", user.sub);
    const message = `You have successfully purchased ${quantity} $${symbol}.`;
    purchasing.done(
      <StockPurchaseStatus
        message={message}
        status="success" />
    );

    history.done((messages: ServerMessage[]) => messages.map(m => {
      return m.id === messageID ? {
        ...m,
        content: `User has successfully purchased ${quantity} stocks of ${symbol} at the price of $ ${price}.`,
        componentName: serialization.names.get(StockPurchase),
        params: {
          ...m.params,
          result: {
            message,
            status: "success",
          }
        }
      } : m;
    }));
  });

  return {
    purchasingUI: purchasing.value,
  };
}

export const confirmPurchase = withCheckPermission({
  checker: async (params) => {
    return withFGA({
      object: `asset:${params.symbol.toLowerCase()}`,
      relation: RELATION.CAN_BUY_STOCKS,
      context: { current_time: new Date().toISOString() },
    });
  },
  onUnauthorized: async (params) => {
    const purchasing = createStreamableUI(null);
    const history = getMutableAIState();
    const message = `You are not authorized to purchase ${params.quantity} stocks of ${params.symbol}.`;

    purchasing.done(
      <StockPurchaseStatus message={message} status="failure" />
    );

    history.done((messages: ServerMessage[]) => messages.map(m => {
      return m.id === params.messageID ? {
        ...m,
        content: message,
        componentName: serialization.names.get(StockPurchase),
        params: {
          ...m.params,
          result: {
            status: "failure",
            message,
          }
        }
      } : m;
    }));

    return {
      purchasingUI: purchasing.value,
    };
  }
}, confirmPurchaseInternal);
