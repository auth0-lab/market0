"use client";

import { useUIState } from "ai/rsc";
import { redirect } from "next/navigation";

import { useChat } from "@/components/chat/context";
import { CircleIcon, Market0Icon, SimplePlusIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useScrollAnchor } from "@/hooks/chat/use-scroll-anchor";
import { cn } from "@/lib/utils";
import { ClientMessage } from "@/llm/types";

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export default function Chat() {
  const { scrollRef, messagesRef, visibilityRef } = useScrollAnchor();
  const [conversation] = useUIState();
  const { readOnly, ownerProfile } = useChat();

  return (
    <main className="flex flex-1 overflow-hidden w-full mx-auto" style={{ maxHeight: "calc(100vh - 56px)" }}>
      <div
        ref={scrollRef}
        className="flex flex-col flex-no-wrap h-full overflow-y-auto overscroll-y-none gap-2 sm:gap-3 w-full"
      >
        <div className="flex-1 overflow-y-auto">
          <div
            ref={messagesRef}
            className={cn("flex-1 min-w-0 max-w-4xl mx-auto w-full px-3 sm:px-1", {
              hidden: conversation.length === 0,
            })}
          >
            {conversation.map((message: ClientMessage) =>
              message.role === "user" ? (
                <div key={message.id} className="flex flex-row gap-3 py-3 items-center justify-end">
                  <div className="relative w-fit sm:max-w-[70%] text-sm sm:text-base text-stone-600 font-light bg-[#F4F4F4] rounded-full px-5 py-2.5">
                    {message.display}
                  </div>
                  <div className="border rounded-full h-8 w-8 min-w-8 flex items-center justify-center">
                    <Avatar className="h-full w-full rounded-full">
                      <AvatarImage src={ownerProfile?.picture!} alt={ownerProfile?.nickname!} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ) : message.role === "assistant" || message.role === "function" ? (
                <div key={message.id} className="flex flex-row gap-3 pt-3">
                  <div className="border rounded-full h-8 w-8 min-w-8 flex items-center justify-center">
                    <Market0Icon />
                  </div>
                  <div className="w-full font-light text-stone-600 flex items-center text-sm sm:text-base">
                    {message.display}
                  </div>
                </div>
              ) : null
            )}

            <div ref={visibilityRef} className="w-full h-px" />
          </div>
          {conversation.length === 0 && (
            <div className="flex flex-col gap-60 max-w-4xl mx-auto w-full mt-auto h-full justify-between">
              <div className="min-w-0 min-h-0 w-full flex flex-col items-center gap-2 sm:gap-6 mt-28 sm:mt-52 px-3 sm:px-1">
                <div className="min-h-8">
                  <Market0Icon />
                </div>
                <h1 className="text-3xl sm:text-6xl tracking-tight leading-[72px]">
                  Welcome to{" "}
                  <span className="bg-text-gradient bg-clip-text" style={{ WebkitTextFillColor: "transparent" }}>
                    Market0
                  </span>
                </h1>
                <p className="text-base tracking-wide text-slate-500 font-light leading-6 text-center px-10 sm:px-0">
                  Market0 is a demo app that showcases secure auth patterns for GenAI apps
                </p>
              </div>
              <div className="w-full px-3 sm:px-1">
                <div className="flex flex-col gap-5 items-center mb-5">
                  <CircleIcon />
                  <span className="text-slate-500 text-sm font-light">Get started with these examples</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {readOnly && (
          <div
            className={cn(
              "flex-shrink-1 min-w-0 min-h-0 bg-white max-w-4xl mx-auto w-full px-3 sm:px-1 h-fit",
              "mb-5 text-sm sm:text-base"
            )}
          >
            <div className="p-3 bg-gray-100 rounded-xl">
              <div className="flex flex-row justify-between items-center gap-2 ">
                <p className="w-full ps-3 text-slate-500">You have view-only access for this chat.</p>
                <Button
                  className="py-2 px-4 m-0 text-sm font-light flex gap-2"
                  variant="default"
                  onClick={() => {
                    window.location.href = "/";
                  }}
                >
                  <SimplePlusIcon /> Start New Chat
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
