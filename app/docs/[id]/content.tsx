/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { redirect, useRouter } from "next/navigation";

import Explanation from "@/components/explanation/explanation";
import { ExplanationType, ObservableProvider } from "@/components/explanation/observable";
import { ArrowRightIcon, SimplePlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

const ExplanationUrlMapper: Record<string, ExplanationType> = {
  "call-apis-on-users-behalf": ExplanationType.StocksUpcomingEvents,
  "authorization-for-rag": ExplanationType.Documents,
  "async-user-confirmation": ExplanationType.StockConditionalPurchase,
};

const ExplanationImageMapper: Record<string, string> = {
  "call-apis-on-users-behalf": "https://cdn.auth0.com/website/labs/ai/assets/use-case-2.png",
  "authorization-for-rag": "https://cdn.auth0.com/website/labs/ai/assets/use-case-3.png",
  "async-user-confirmation": "https://cdn.auth0.com/website/labs/ai/assets/use-case-4.png",
};

export function Content({ id }: { id: string }) {
  const router = useRouter();
  const explanationType = ExplanationUrlMapper[id];

  if (!explanationType) {
    redirect("/not-found");
  }

  function onExplanationChange(value: ExplanationType) {
    //
    switch (value) {
      case ExplanationType.StocksUpcomingEvents:
        router.push("/docs/call-apis-on-users-behalf");
        break;
      case ExplanationType.Documents:
        router.push("/docs/authorization-for-rag");
        break;
      case ExplanationType.StockConditionalPurchase:
        router.push("/docs/async-user-confirmation");
        break;
    }
  }

  return (
    <ObservableProvider>
      <div className="h-full">
        <main
          className="flex flex-col sm:flex-row overflow-y-auto sm:overflow-hidden w-full h-full mx-auto border-t border-gray-100 "
          style={{ maxHeight: "calc(100vh - 56px)" }}
        >
          <div className="flex-1 h-full w-full border-r border-[#E5EAF2] p-8">
            <Link
              href="https://auth0.ai"
              className="hover:text-black transition-all duration-300 text-sm font-light text-slate-500 items-center gap-1 flex"
            >
              <div className="rotate-180">
                <ArrowRightIcon />
              </div>{" "}
              Back to Auth0.ai
            </Link>

            <div className="bg-[#FAFAFD] mx-auto mt-8 sm:mt-16 h-fit sm:h-[70%] p-6 sm:p-20 rounded-xl sm:rounded-3xl w-fit">
              <img className="object-contain h-full" src={ExplanationImageMapper[id]} alt="mock" />
            </div>

            <div className="flex flex-col justify-between items-center gap-4 mt-8 sm:mt-16">
              <Button
                className="py-2 px-4 m-0 text-sm font-light flex gap-2"
                variant="default"
                onClick={() => {
                  window.location.href = "/api/auth/login";
                }}
              >
                <SimplePlusIcon /> Start New Chat
              </Button>
              <p className="ps-3 text-slate-500 font-light text-sm text-center">
                You are viewing use cases docs. Start a new chat to explore the demo.
              </p>
            </div>
          </div>
          <Explanation
            expand={true}
            allowToggleExpand={false}
            explanationType={explanationType}
            onChange={onExplanationChange}
          />
        </main>
      </div>
    </ObservableProvider>
  );
}
