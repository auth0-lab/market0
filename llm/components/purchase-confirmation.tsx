import { CheckGreenIcon, StockDownIcon, StockUpIcon } from "@/components/icons";

import WarningWrapper from "./warning-wrapper";

export const PurchaseConfirmation = ({
  amount,
  price,
  symbol,
  market,
  currency,
  company,
  delta,
}: {
  amount: number;
  price: number;
  symbol: string;
  market: string;
  currency: string;
  company: string;
  delta: number;
}) => {
  return (
    <WarningWrapper>
      <div className="p-4 text-green-400 rounded-2xl bg-zinc-950 pt-14">
        <div className="flex flex-row justify-between px-10">
          <div className="flex flex-col gap-2">
            <div className="text-xl font-semibold text-white">{symbol}</div>

            <div className="mt-1 text-base text text-white/40 leading-6">
              {company} • {market} • {currency}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xl font-semibold text-white text-right">
              ${price}
            </div>
            <div
              className={`inline-flex items-center gap-2 text-base ${
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

        <div className="flex flex-row gap-4 px-10 mt-8 items-center mb-10">
          <CheckGreenIcon />
          <div className="text-white text-xl font-light">
            You have successfully purchased {amount} ${symbol}.
          </div>
        </div>
      </div>
    </WarningWrapper>
  );
};
