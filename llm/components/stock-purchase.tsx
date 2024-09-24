"use client";

import { useActions, useUIState } from "ai/rsc";
import { useId, useState } from "react";

import { StockDownIcon, StockUpIcon } from "@/components/icons";
import { formatNumber } from "@/lib/utils";

import { ClientMessage } from "../types";
import WarningWrapper from "./warning-wrapper";

export function StockPurchase({
  numberOfShares,
  symbol,
  delta,
  price,
  market,
  currency,
  company,
}: {
  numberOfShares?: number;
  symbol: string;
  delta: number;
  price: number;
  market: string;
  currency: string;
  company: string;
}) {
  const [value, setValue] = useState(numberOfShares || 100);
  const [purchasingUI, setPurchasingUI] = useState<null | React.ReactNode>(
    null
  );
  const [messages, setMessages] = useUIState();
  const { confirmPurchase } = useActions();
  const id = useId();

  function onSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = Number(e.target.value);
    setValue(newValue);

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
      <div className="p-4 text-green-400 rounded-2xl bg-zinc-950 pt-5">
        <div className="flex flex-row justify-between px-3">
          <div className="flex flex-col gap-2">
            <div className="text-base font-semibold text-white">{symbol}</div>

            <div className="text-sm text text-white/40 leading-6">
              {company} • {market} • {currency}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-base font-semibold text-white text-right">
              ${price}
            </div>
            <div
              className={`inline-flex items-center gap-2 text-sm ${
                delta > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {delta > 0 ? <StockUpIcon /> : <StockDownIcon />}
              <span>
                {delta} (
                {`${delta > 0 ? "+" : ""}${((delta / price) * 100).toFixed(
                  2
                )}%`}
                )
              </span>
            </div>
          </div>
        </div>

        {purchasingUI ? (
          <div className="flex flex-row gap-4 pb-2 mt-5 mx-3 border-t border-white/20 pt-5 items-center">
            <div className="text-white text-lg font-light">{purchasingUI}</div>
          </div>
        ) : (
          <>
            <div className="relative pb-5 mt-5 mx-3 border-t border-white/20 pt-5">
              <p className="text-white/80 text-base mb-5">Shares to purchase</p>
              <input
                id="labels-range-input"
                type="range"
                value={value}
                onChange={onSliderChange}
                min="0"
                max="1000"
                className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-zinc-600 accent-green-500 dark:bg-zinc-700"
              />
              <span className="absolute text-xs bottom-1 start-0 text-zinc-400">
                0
              </span>
              <span className="absolute text-xs -translate-x-1/2 bottom-1 start-1/3 text-zinc-400 rtl:translate-x-1/2">
                100
              </span>
              <span className="absolute text-xs -translate-x-1/2 bottom-1 start-2/3 text-zinc-400 rtl:translate-x-1/2">
                500
              </span>
              <span className="absolute text-xs bottom-1 end-0 text-zinc-400">
                1000
              </span>
            </div>

            <div className="mt-6 mx-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-medium text-white text-sm mb-1">
                    Total cost
                  </p>
                  <div className="flex flex-row gap-2 text-white text-sm font-light">
                    {value} shares x ${price} per share
                  </div>
                </div>
                <div className="text-xl leading-8 font-semibold">
                  <span>{formatNumber(value * price)}</span>
                </div>
              </div>
            </div>

            <div className="mx-3 mb-3">
              <button
                className="w-full py-2 mt-6 bg-green-500 rounded-lg text-black text-base font-normal"
                onClick={async () => {
                  const response = await confirmPurchase(
                    symbol,
                    price,
                    value,
                    market,
                    currency,
                    company,
                    delta
                  );
                  setPurchasingUI(response.purchasingUI);

                  // Insert a new system message to the UI.
                  setMessages((prevMessages: ClientMessage[]) => [
                    ...prevMessages,
                    response.newMessage,
                  ]);
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
