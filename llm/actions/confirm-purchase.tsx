"use server";

import { createStreamableUI, getMutableAIState } from "ai/rsc";

import { CheckGreenIcon } from "@/components/icons";
import { createTransaction } from "@/lib/db";
import { runAsyncFnWithoutBlocking } from "@/lib/utils";
import * as serialization from "@/llm/components/serialization";
import { getUser } from "@/sdk/fga";

import { PurchaseConfirmation } from "../components/purchase-confirmation";
import { ServerMessage } from "../types";

export async function confirmPurchase(
  symbol: string,
  price: number,
  amount: number,
  market: string,
  currency: string,
  company: string,
  delta: number
) {
  "use server";
  const user = await getUser();
  const history = getMutableAIState();

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      <p>
        Purchasing {amount} ${symbol}...
      </p>
    </div>
  );

  const systemMessage = createStreamableUI(null);

  runAsyncFnWithoutBlocking(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        <p>
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>
    );

    await createTransaction(symbol, price, amount, "buy", user.sub);

    //we could use also PurchaseConfirmation
    purchasing.done(
      <div className="flex flex-row gap-4 items-center">
        <CheckGreenIcon />
        You have successfully purchased {amount} ${symbol}.
      </div>
    );

    systemMessage.done(
      <>
        You have purchased {amount} shares of {symbol} at ${price}.
      </>
    );

    history.done((messages: ServerMessage[]) => [
      ...messages,
      {
        role: "assistant",
        content: `[User has purchased ${amount} shares of ${symbol} at ${price}.`,
        componentName: serialization.names.get(PurchaseConfirmation)!,
        params: {
          amount,
          price,
          symbol,
          market,
          currency,
          company,
          delta,
        },
      },
    ]);
  });

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: Date.now(),
      display: systemMessage.value,
    },
  };
}
