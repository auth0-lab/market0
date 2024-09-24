"use client";

import { format, formatRelative } from "date-fns";
import { useCallback, useEffect, useState } from "react";

import { CancelRedIcon, CheckGreenIcon } from "@/components/icons";
import Loader from "@/components/loader";
import { ConditionalPurchase as ConditionalPurchaseType } from "@/lib/db/conditional-purchases";
import { getConditionalPurchaseById } from "@/llm/actions/conditional-purchases";
import {
  isGuardianEnrolled,
  requireGuardianEnrollment,
} from "@/sdk/auth0/mgmt";

import WarningWrapper from "./warning-wrapper";

export function ConditionalPurchase({
  id,
  isMFAEnrolled,
}: {
  id: string;
  isMFAEnrolled: boolean;
}) {
  const [isWorking, setIsWorking] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(isMFAEnrolled);
  const [conditionalPurchase, setConditionalPurchase] =
    useState<ConditionalPurchaseType | null>(null);

  const checkGuardianEnrollment = useCallback(async () => {
    const isEnrolled = await isGuardianEnrolled();

    if (!isEnrolled) {
      await requireGuardianEnrollment();
    }

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

  if (!conditionalPurchase) {
    return <div>Conditional purchase not found</div>;
  }

  if (!isEnrolled) {
    return (
      <div className="border border-gray-300 rounded-lg p-6 flex items-center w-full justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-base leading-6 font-semibold">
            Multi-factor authentication
          </h2>
          <p className="text-sm leading-5 font-light text-gray-500">
            Auth0 Guardian Enrollment is required before proceeding to schedule
            the task.
          </p>
        </div>
        <div>
          <a
            href={`/api/auth/login?return_to=${window.location.pathname}`}
            className="bg-gray-200 text-black whitespace-nowrap rounded-md text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 hover:text-white py-2 px-4"
          >
            Enroll
          </a>
        </div>
      </div>
    );
  }

  async function simulateExecution() {
    setSimulating(true);
    await fetch("/api/hooks", {
      method: "POST",
      body: JSON.stringify({
        type: "metric",
        data: {
          symbol: "ZEKO",
          metric: "P/E",
          value: 51.53,
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
          message={
            <>
              {!simulating && (
                <div className="text-slate-500 text-sm leading-6">
                  To simulate the agent executing the task, please click{" "}
                  <button
                    className="border-b border-slate-500 leading-none"
                    onClick={simulateExecution}
                  >
                    here
                  </button>
                  .
                </div>
              )}
              {simulating && (
                <div className="flex gap-3 items-center w-fit mx-auto text-slate-500 text-sm leading-6">
                  Simulating <Loader />
                </div>
              )}
            </>
          }
        >
          <div className="p-8 rounded-2xl bg-zinc-950 text-white text-base">
            Noted. I will proceed with purchasing {conditionalPurchase.quantity}{" "}
            shares of{" "}
            <span className="text-green-400">
              ${conditionalPurchase.symbol}
            </span>{" "}
            once its{" "}
            <span className="text-green-400">
              {conditionalPurchase.metric} {conditionalPurchase.operator}{" "}
              {conditionalPurchase.threshold}
            </span>
            .
          </div>
        </WarningWrapper>
      );
    case "canceled":
      return (
        <WarningWrapper className="max-w-xl">
          <div className="p-5 rounded-2xl bg-zinc-950 text-white">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-2">
                <div className="text-base font-semibold text-white">
                  Buy {conditionalPurchase.quantity} shares of{" "}
                  {conditionalPurchase.symbol}
                </div>
                <div className="text-sm text text-white/40 leading-6">
                  Created{" "}
                  {formatRelative(conditionalPurchase.created_at, new Date())}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-base font-semibold text-green-400">
                  If {conditionalPurchase.metric} {conditionalPurchase.operator}{" "}
                  {conditionalPurchase.threshold}
                </div>
                <div className="text-sm text text-white/40 leading-6 uppercase">
                  Condition
                </div>
              </div>
            </div>
            <div className="border-t border-white/20 mt-5 pt-5">
              <div className="flex flex-row gap-4 items-start">
                <div className="w-[25px]">
                  <CancelRedIcon />
                </div>
                <div className="text-white font-light">
                  The purchase was{" "}
                  <strong className="text-red-400">CANCELED</strong> on{" "}
                  {format(conditionalPurchase.updated_at, "PPPP p")}.
                </div>
              </div>
            </div>
          </div>
        </WarningWrapper>
      );
    case "completed":
      return (
        <WarningWrapper className="max-w-xl">
          <div className="p-5 rounded-2xl bg-zinc-950 text-white">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-2">
                <div className="text-base font-semibold text-white">
                  Buy {conditionalPurchase.quantity} shares of{" "}
                  {conditionalPurchase.symbol}
                </div>
                <div className="text-sm text text-white/40 leading-6">
                  Created{" "}
                  {formatRelative(conditionalPurchase.created_at, new Date())}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-base font-semibold text-green-400">
                  If {conditionalPurchase.metric} {conditionalPurchase.operator}{" "}
                  {conditionalPurchase.threshold}
                </div>
                <div className="text-sm text text-white/40 leading-6 uppercase">
                  Condition
                </div>
              </div>
            </div>
            <div className="border-t border-white/20 mt-5 pt-5">
              <div className="flex flex-row gap-4 items-start">
                <div className="w-[25px]">
                  <CheckGreenIcon />
                </div>
                <div className="text-white font-light">
                  The purchase was{" "}
                  <strong className="text-green-400">COMPLETED</strong> on{" "}
                  {format(conditionalPurchase.updated_at, "PPPP p")}.
                </div>
              </div>
            </div>
          </div>
        </WarningWrapper>
      );
  }
}
