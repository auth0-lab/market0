"use server";

import { createStreamableUI, getMutableAIState } from "ai/rsc";

import { CancelRedIcon, CheckGreenIcon } from "@/components/icons";
import { RELATION } from "@/lib/constants";
import { createTransaction } from "@/lib/db";
import { runAsyncFnWithoutBlocking } from "@/lib/utils";
import * as serialization from "@/llm/components/serialization";
import { getUser, withFGA } from "@/sdk/fga";
import { withCheckPermission } from "@/sdk/fga/next/with-check-permission";

import { PurchaseConfirmation } from "../components/purchase-confirmation";
import { ServerMessage } from "../types";

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
    <div className="inline-flex items-start gap-1 md:items-center">
      <p>
        Purchasing {quantity} ${symbol}...
      </p>
    </div>
  );

  runAsyncFnWithoutBlocking(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        <p>
          Purchasing {quantity} ${symbol}... working on it...
        </p>
      </div>
    );

    await createTransaction(symbol, price, quantity, "buy", user.sub);
    const message = `You have successfully purchased ${quantity} $${symbol}.`;
    //we could use also PurchaseConfirmation
    purchasing.done(
      <div className="flex flex-row gap-4 items-center">
        <CheckGreenIcon />
        {message}
      </div>
    );

    history.done((messages: ServerMessage[]) => messages.map(m => {
      return m.id === messageID ? {
        ...m,
        content: `User has successfully purchased ${quantity} stocks of ${symbol} at the price of $ ${price}.`,
        componentName: serialization.names.get(PurchaseConfirmation),
        params: {
          ...m.params,
          success: true,
          quantity,
          symbol,
          price,
          message
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
      <div className="flex flex-row gap-4 items-center">
        <CancelRedIcon />
        {message}
      </div>
    );

    history.done((messages: ServerMessage[]) => messages.map(m => {
      return m.id === params.messageID ? {
        ...m,
        content: message,
        componentName: serialization.names.get(PurchaseConfirmation),
        params: {
          ...m.params,
          quantity: params.quantity,
          price: params.price,
          symbol: params.symbol,
          message,
          success: false,
        }
      } : m;
    }));

    return {
      purchasingUI: purchasing.value,
    };
  }
}, confirmPurchaseInternal);
