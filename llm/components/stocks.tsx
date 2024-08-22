"use client";

import { useActions, useUIState } from "ai/rsc";

import { StockDownIcon, StockUpIcon } from "@/components/icons";

import { ClientMessage } from "../types";
import WarningWrapper from "./warning-wrapper";

export function Stocks({ stocks }: { stocks: any[] }) {
  const [, setMessages] = useUIState();
  const { continueConversation } = useActions();

  return (
    <WarningWrapper className="max-w-[550px]">
      <div className="flex flex-col gap-2">
        {stocks.map((stock) => (
          <button
            className="flex p-8 text-green-400 rounded-2xl bg-zinc-950 hover:bg-zinc-800 transition-all duration-300"
            key={stock.symbol}
            onClick={async () => {
              const response = await continueConversation(
                `View ${stock.symbol}`
              );
              setMessages((prevMessages: ClientMessage[]) => [
                ...prevMessages,
                response,
              ]);
            }}
          >
            <div className="flex flex-row justify-between gap-4 w-full">
              <div className="flex flex-col gap-2">
                <div className="text-xl font-semibold text-white text-left">
                  {stock.symbol}
                </div>

                <div className="text-base text text-white/40 leading-6">
                  {stock.company} • {stock.market} • {stock.currency}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xl font-semibold text-white text-right">
                  ${stock.price}
                </div>
                <div
                  className={`inline-flex items-center gap-2 text-base ${
                    stock.delta > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stock.delta > 0 ? <StockUpIcon /> : <StockDownIcon />}
                  <span>
                    {stock.delta} (
                    {`${stock.delta > 0 ? "+" : ""}${(
                      (stock.delta / stock.price) *
                      100
                    ).toFixed(2)}%`}
                    )
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </WarningWrapper>
  );
}
