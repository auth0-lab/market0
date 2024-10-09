"use client";

import { useActions, useUIState } from "ai/rsc";
import { useId, useState } from "react";

import { StockDownIcon, StockUpIcon } from "@/components/icons";
import { formatNumber } from "@/lib/utils";

import { StockPurchaseStatus } from "./stock-purchase-status";
import WarningWrapper from "./warning-wrapper";

type StockPurchaseUIParams = {
  /**
   * If specified by the user, the initial quantity to purchase.
   */
  initialQuantity?: number;

  /**
   * The stock symbol to purchase.
   */
  symbol: string;

  /**
   * The change in price of the stock.
   */
  delta: number;

  /**
   * The price of the stock.
   */
  price: number;

  /**
   * The market of the stock.
   */
  market: string;

  /**
   * The currency of the stock.
   */
  currency: string;

  /**
   * The company name of the stock.
   */
  company: string;

  /**
   * The message ID that triggered this component.
   */
  messageID: string;

  /**
   * Holds the result of the user interaction with the component.
   */
  result?: {
    message: string;
    status: "success" | "failure";
  };
};

export function StockPurchase({
  initialQuantity,
  symbol,
  delta,
  price,
  market,
  currency,
  company,
  messageID,
  result,
}: StockPurchaseUIParams) {
  const [quantity, setQuantity] = useState(initialQuantity || 100);
  const [purchasingUI, setPurchasingUI] = useState<null | React.ReactNode>(
    result ? <StockPurchaseStatus {...result} /> : null
  );
  const [messages, setMessages] = useUIState();
  const { confirmPurchase } = useActions();
  const id = useId();

  function onSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = Number(e.target.value);
    setQuantity(newValue);

    const info = {
      role: "system",
      content: `[User has changed to purchase ${newValue} shares of ${symbol}.`,
      id,
    };

    // If last history state is already this info, update it. This is to avoid
    // adding every slider change to the history.
    if (messages[messages.length - 1]?.id === id) {
      setMessages([...messages.slice(0, -1), info]);
      return;
    } else {
      // If it doesn't exist, append it to history.
      setMessages([...messages, info]);
    }
  }

  return (
    <WarningWrapper className="max-w-xl">
      <div className="p-2 sm:p-4 text-green-400 rounded-2xl bg-zinc-950 pt-3 sm:pt-5">
        <div className="flex flex-row justify-between px-2 sm:px-3">
          <div className="flex flex-col gap-2">
            <div className="text-base font-semibold text-white">{symbol}</div>

            <div className="text-xs sm:text-sm text text-white/40 leading-6">
              {company} • {market} • {currency}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-base font-semibold text-white text-right">${price}</div>
            <div
              className={`inline-flex items-center gap-2 text-xs sm:text-sm ${
                delta > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {delta > 0 ? <StockUpIcon /> : <StockDownIcon />}
              <span>
                {delta} ({`${delta > 0 ? "+" : ""}${((delta / price) * 100).toFixed(2)}%`})
              </span>
            </div>
          </div>
        </div>

        {purchasingUI ? (
          <div className="flex flex-row gap-4 pb-2 mt-5 mx-3 border-t border-white/20 pt-5 items-center">
            <div className="text-white text-base sm:text-lg font-light">{purchasingUI}</div>
          </div>
        ) : (
          <>
            <div className="relative pb-5 mt-5 mx-2 sm:mx-3 border-t border-white/20 pt-5">
              <p className="text-white/80 text-sm sm:text-base mb-5">Shares to purchase</p>
              <input
                id="labels-range-input"
                type="range"
                value={quantity}
                onChange={onSliderChange}
                min="0"
                max="1000"
                className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-zinc-600 accent-green-500 dark:bg-zinc-700"
              />
              <span className="absolute text-xs bottom-1 start-0 text-zinc-400">0</span>
              <span className="absolute text-xs -translate-x-1/2 bottom-1 start-1/3 text-zinc-400 rtl:translate-x-1/2">
                100
              </span>
              <span className="absolute text-xs -translate-x-1/2 bottom-1 start-2/3 text-zinc-400 rtl:translate-x-1/2">
                500
              </span>
              <span className="absolute text-xs bottom-1 end-0 text-zinc-400">1000</span>
            </div>

            <div className="mt-6 mx-2 sm:mx-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-medium text-white text-sm mb-1">Total cost</p>
                  <div className="flex flex-row gap-2 text-white text-sm font-light">
                    {quantity} shares x ${price} per share
                  </div>
                </div>
                <div className="text-xl font-semibold">
                  <span>{formatNumber(quantity * price)}</span>
                </div>
              </div>
            </div>

            <div className="mx-2 sm:mx-3 mb-3">
              <button
                className="w-full py-2 mt-6 bg-green-500 rounded-lg text-black text-sm sm:text-base font-normal"
                onClick={async () => {
                  const response = await confirmPurchase({
                    symbol,
                    price,
                    quantity,
                    messageID,
                  });
                  setPurchasingUI(response.purchasingUI);
                }}
              >
                Purchase
              </button>
            </div>
          </>
        )}
      </div>
    </WarningWrapper>
  );
}
