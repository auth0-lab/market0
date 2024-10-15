"use client";

import { useActions, useUIState } from "ai/rsc";

import { transactions } from "@/lib/db";
import { cn } from "@/lib/utils";

import { ClientMessage } from "../types";
import WarningWrapper from "./warning-wrapper";

export function Positions({ positions, readOnly = false }: { positions: transactions.Position[]; readOnly?: boolean }) {
  const [, setMessages] = useUIState();
  const { continueConversation } = useActions();

  return (
    <WarningWrapper className="max-w-sm" readOnly={readOnly}>
      <div className="flex flex-col gap-2">
        {positions.map((position) => (
          <button
            key={position.ticker_id}
            className={cn(
              "flex p-4 sm:p-5 text-green-400 rounded-2xl bg-zinc-950 hover:bg-zinc-800 transition-all duration-300",
              { "hover:bg-zinc-950": readOnly }
            )}
            onClick={async () => {
              const response = await continueConversation(`View ${position.ticker_id}`);
              setMessages((prevMessages: ClientMessage[]) => [...prevMessages, response]);
            }}
          >
            <div className="flex flex-row justify-between w-full items-end px-1 sm:px-3">
              <div className="flex flex-col gap-2">
                <div className="text-sm sm:text-base text-white leading-6 text-left">{position.ticker_id}</div>
                <div className="text-sm sm:text-base font-semibold text-white text-left">Qty: {position.quantity}</div>
              </div>
              <div className="text-xs sm:text-sm text-white text-right">
                Avg. Price: ${parseFloat(position.av_price.toString()).toFixed(2)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </WarningWrapper>
  );
}
