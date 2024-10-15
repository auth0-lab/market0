"use client";

import { useActions, useUIState } from "ai/rsc";

import { StockDownIcon, StockUpIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

import { ClientMessage } from "../../types";
import WarningWrapper from "../warning-wrapper";

export function Stocks({ stocks, readOnly = false }: { stocks: any[]; readOnly?: boolean }) {
  const [, setMessages] = useUIState();
  const { continueConversation } = useActions();

  return (
    <WarningWrapper className="max-w-xl" readOnly={readOnly}>
      <div className="flex flex-col gap-2">
        {stocks.map((stock) => (
          <button
            className={cn(
              "flex p-5 text-green-400 rounded-2xl bg-zinc-950 hover:bg-zinc-800 transition-all duration-300",
              { "hover:bg-zinc-950": readOnly }
            )}
            disabled={readOnly}
            key={stock.symbol}
            onClick={async () => {
              const response = await continueConversation({ message: `View ${stock.symbol}`, hidden: true });
              setMessages((prevMessages: ClientMessage[]) => [...prevMessages, response]);
            }}
          >
            <div className="flex flex-row justify-between px-3 w-full">
              <div className="flex flex-col gap-2">
                <div className="text-base font-semibold text-white text-left">{stock.symbol}</div>

                <div className="text-sm text text-white/40 leading-6">
                  {stock.company} • {stock.market} • {stock.currency}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-base font-semibold text-white text-right">${stock.price}</div>
                <div
                  className={`inline-flex items-center gap-2 text-sm ${
                    stock.delta > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stock.delta > 0 ? <StockUpIcon /> : <StockDownIcon />}
                  <span>
                    {stock.delta} ({`${stock.delta > 0 ? "+" : ""}${((stock.delta / stock.price) * 100).toFixed(2)}%`})
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
