"use client";

import { useEffect, useState } from "react";

import { ExplanationMeta, ExplanationType, useObservable } from "@/components/explanation/observable";
import { cn } from "@/lib/utils";
import Events from "@/llm/components/events/events.mdx";
import Forecasts from "@/llm/components/forecasts/documents.mdx";
import ConditionalPurchase from "@/llm/components/stocks/conditional-purchase.mdx";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function Explanation() {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [lastExplanation, setLastExplanation] = useState<ExplanationMeta>({
    type: ExplanationType.StocksUpcomingEvents,
  });
  const { explanation, setExplanation } = useObservable();

  useEffect(() => {
    if (explanation) {
      setExpanded(!!explanation.expand);
      setLastExplanation(explanation);
    }
  }, [explanation]);

  function toggleExpanded() {
    setExpanded(!expanded);
    setExplanation(null);
  }

  function handleOnChange(value: ExplanationType) {
    setLastExplanation({ type: value });
  }

  return (
    <div className={cn("flex flex-col flex-no-wrap h-full transition-all duration-150", expanded ? "w-full" : "w-10")}>
      <div
        className={cn(
          "border-l border-t border-l-gray-200 border-t-gray-100 flex-1 transition-all duration-150 h-full pb-5",
          expanded ? "bg-gray-50" : "bg-white"
        )}
      >
        <div
          className={cn(
            "w-full h-14 bg-white flex items-center justify-between gap-3 px-2 border-gray-100",
            expanded ? "border-b" : "border-none"
          )}
        >
          <div className="flex items-center gap-3">
            <button onClick={toggleExpanded}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn("transition-all duration-150", expanded ? "" : "rotate-180")}
              >
                <path
                  d="M26 34L36 24L26 14M12 34L22 24L12 14"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-black"
                />
              </svg>
            </button>
            {expanded && <div className="text-sm font-medium">Behind the scene</div>}
          </div>
          {expanded && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Use case</span>
              <Select value={lastExplanation?.type} onValueChange={handleOnChange}>
                <SelectTrigger className="w-[230px] py-0 text-gray-500 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem className="text-gray-500 text-sm" value={ExplanationType.StocksUpcomingEvents}>
                      Call APIs on users' behalf
                    </SelectItem>
                    <SelectItem className="text-gray-500 text-sm" value={ExplanationType.Documents}>
                      Authorization for RAG
                    </SelectItem>
                    <SelectItem className="text-gray-500 text-sm" value={ExplanationType.StockConditionalPurchase}>
                      Async User Confirmartion
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {expanded && (
          <>
            <div className="transition-all duration-300 overflow-y-auto h-full p-5 flex-1">
              {lastExplanation?.type === ExplanationType.StocksUpcomingEvents && <Events />}
              {lastExplanation?.type === ExplanationType.StockConditionalPurchase && <ConditionalPurchase />}
              {lastExplanation?.type === ExplanationType.Documents && <Forecasts />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
