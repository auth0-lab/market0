import { CancelRedIcon, CheckGreenIcon, StockDownIcon, StockUpIcon } from "@/components/icons";

import WarningWrapper from "./warning-wrapper";

export const PurchaseConfirmation = ({
  quantity,
  price,
  symbol,
  market,
  currency,
  company,
  delta,
  message,
  success
}: {
  quantity: number;
  price: number;
  symbol: string;
  market: string;
  currency: string;
  company: string;
  delta: number;
  message: string;
  success: boolean;
}) => {
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

        <div className="flex flex-row gap-4 pb-2 mt-5 mx-3 border-t border-white/20 pt-5 items-center">
          { success ? <CheckGreenIcon /> : <CancelRedIcon />}
          <div className="text-white text-lg font-light">
            {message}
          </div>
        </div>
      </div>
    </WarningWrapper>
  );
};
