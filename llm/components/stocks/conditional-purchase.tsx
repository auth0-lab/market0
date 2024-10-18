"use client";

import { format, formatRelative } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { BrowserView, MobileView } from "react-device-detect";

import { ExplanationType } from "@/components/explanation/observable";
import { CancelRedIcon, CheckGreenIcon, TaskIcon } from "@/components/icons";
import Loader from "@/components/loader";
import { ConditionalPurchase as ConditionalPurchaseType } from "@/lib/db/conditional-purchases";
import { getConditionalPurchaseById } from "@/llm/actions/conditional-purchases";
import { isGuardianEnrolled } from "@/sdk/auth0/mgmt";

import { NotAvailableReadOnly } from "../not-available-read-only";
import WarningWrapper from "../warning-wrapper";

export function ConditionalPurchase({
  id,
  isMFAEnrolled,
  readOnly = false,
}: {
  id: string;
  isMFAEnrolled: boolean;
  readOnly?: boolean;
}) {
  const [isWorking, setIsWorking] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(isMFAEnrolled);
  const [conditionalPurchase, setConditionalPurchase] = useState<ConditionalPurchaseType | null>(null);

  const checkGuardianEnrollment = useCallback(async () => {
    const isEnrolled = await isGuardianEnrolled();
    setIsEnrolled(isEnrolled);
  }, []);

  const readConditionalPurchase = useCallback(async () => {
    let conditionalPurchase = await getConditionalPurchaseById(id);

    if (!conditionalPurchase) {
      return;
    }

    setConditionalPurchase(conditionalPurchase);
  }, [id]);

  useEffect(() => {
    if (readOnly) {
      setIsWorking(false);
      return;
    }

    (async () => {
      await readConditionalPurchase();
      await checkGuardianEnrollment();
      setIsWorking(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isWorking) {
    return <Loader />;
  }

  if (readOnly) {
    return <NotAvailableReadOnly />;
  }

  if (!conditionalPurchase) {
    return <div>Conditional purchase not found</div>;
  }

  if (!isEnrolled) {
    return (
      <>
        <MobileView>
          <div className="border border-gray-300 rounded-xl items-center w-full justify-between p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-0">
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <p className="text-xs sm:text-sm leading-5 font-light text-gray-500">
                It looks like you&apos;re using a <strong>mobile device</strong>. This demo requires enrollment, which
                involves scanning a QR code.
              </p>
              <p className="text-xs sm:text-sm leading-5 font-bold text-gray-500">
                To try this feature, please open the demo on a computer.
              </p>
            </div>
          </div>
        </MobileView>
        <BrowserView>
          <div className="border border-gray-300 rounded-xl items-center w-full justify-between p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-0">
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <h2 className="text-sm sm:text-base leading-6 font-semibold">
                Action Required: Setup Async Authentication
              </h2>
              <p className="text-xs sm:text-sm leading-5 font-light text-gray-500">
                Please enroll to Auth0 Guardian so we can notify you when the condition is met. This is necessary to
                secure your future transaction.
              </p>
            </div>
            <div className="w-full sm:w-fit">
              <a
                href={`/api/auth/login?returnTo=${window.location.pathname}&screenHint=mfa`}
                className="w-full sm:w-fit inline-block text-center bg-gray-200 text-black whitespace-nowrap rounded-md text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 hover:text-white py-2 px-4"
              >
                Enroll
              </a>
            </div>
          </div>
        </BrowserView>
      </>
    );
  }

  async function simulateExecution() {
    if (!conditionalPurchase) {
      return;
    }

    setSimulating(true);
    const { id: conditional_purchase_id, user_id } = conditionalPurchase;

    await fetch("/api/hooks", {
      method: "POST",
      body: JSON.stringify({
        type: "metric",
        data: {
          conditional_purchase_id,
          user_id,
        },
      }),
    });

    await readConditionalPurchase();
    setSimulating(false);
  }

  switch (conditionalPurchase.status) {
    case "pending":
      return (
        <WarningWrapper
          className="max-w-xl"
          readOnly={readOnly}
          explanationType={ExplanationType.StockConditionalPurchase}
          message={
            <>
              {!simulating && (
                <div className="text-slate-500 text-xs sm:text-sm leading-6">
                  To simulate the agent executing the task, please click{" "}
                  <button className="border-b border-slate-500 leading-none" onClick={simulateExecution}>
                    here
                  </button>
                  .
                </div>
              )}
              {simulating && (
                <div className="flex gap-3 items-center w-fit mx-auto text-slate-500 text-xs sm:text-sm leading-6">
                  Simulating <Loader />
                </div>
              )}
            </>
          }
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-2">
                <div className="text-base font-semibold text-white">Buy {conditionalPurchase.symbol}</div>
                <div className="text-xs sm:text-sm text text-white/40 leading-6">
                  Created {formatRelative(conditionalPurchase.created_at, new Date())}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-base font-semibold text-green-400 text-right">
                  If {conditionalPurchase.metric} {conditionalPurchase.operator} {conditionalPurchase.threshold}
                </div>
                <div className="text-xs sm:text-sm text text-white/40 leading-6 uppercase">Condition</div>
              </div>
            </div>
            <div className="border-t border-white/20 mt-4 sm:mt-5 pt-4 sm:pt-5">
              <div className="flex flex-row gap-3 items-start">
                <div className="w-[25px]">
                  <TaskIcon />
                </div>
                <div className="text-white font-light text-base sm:text-lg">
                  Task: Buy {conditionalPurchase.quantity} ${conditionalPurchase.symbol} shares if{" "}
                  {conditionalPurchase.metric} {conditionalPurchase.operator} {conditionalPurchase.threshold}
                </div>
              </div>
            </div>
          </div>
        </WarningWrapper>
      );
    case "canceled":
      return (
        <WarningWrapper className="max-w-xl" readOnly={readOnly}>
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-2">
                <div className="text-base font-semibold text-white">
                  Buy {conditionalPurchase.quantity} shares of {conditionalPurchase.symbol}
                </div>
                <div className="text-xs sm:text-sm text text-white/40 leading-6">
                  Created {formatRelative(conditionalPurchase.created_at, new Date())}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-base font-semibold text-green-400">
                  If {conditionalPurchase.metric} {conditionalPurchase.operator} {conditionalPurchase.threshold}
                </div>
                <div className="text-xs sm:text-sm text text-white/40 leading-6 uppercase">Condition</div>
              </div>
            </div>
            <div className="border-t border-white/20 mt-4 sm:mt-5 pt-4 sm:pt-5">
              <div className="flex flex-row gap-4 items-start">
                <div className="w-[25px]">
                  <CancelRedIcon />
                </div>
                <div className="text-white font-light text-base sm:text-lg">
                  The purchase was <strong className="text-red-400">CANCELED</strong> on{" "}
                  {format(conditionalPurchase.updated_at, "PPPP p")}.
                </div>
              </div>
            </div>
          </div>
        </WarningWrapper>
      );
    case "completed":
      return (
        <WarningWrapper className="max-w-xl" readOnly={readOnly}>
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-2">
                <div className="text-base font-semibold text-white">
                  Buy {conditionalPurchase.quantity} shares of {conditionalPurchase.symbol}
                </div>
                <div className="text-xs sm:text-sm text text-white/40 leading-6">
                  Created {formatRelative(conditionalPurchase.created_at, new Date())}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-base font-semibold text-green-400">
                  If {conditionalPurchase.metric} {conditionalPurchase.operator} {conditionalPurchase.threshold}
                </div>
                <div className="text-xs sm:text-sm text text-white/40 leading-6 uppercase">Condition</div>
              </div>
            </div>
            <div className="border-t border-white/20 mt-4 sm:mt-5 pt-4 sm:pt-5">
              <div className="flex flex-row gap-4 items-center">
                <div className="w-[25px]">
                  <CheckGreenIcon />
                </div>
                <div className="text-white font-light text-base sm:text-lg">
                  The purchase was <strong className="text-green-400">COMPLETED</strong> on{" "}
                  {format(conditionalPurchase.updated_at, "PPPP p")}.
                </div>
              </div>
            </div>
          </div>
        </WarningWrapper>
      );
  }
}
