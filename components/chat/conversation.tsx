"use client";

import { generateId } from "ai";
import { useActions, useUIState } from "ai/rsc";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useChat } from "@/components/chat/context";
import { Examples } from "@/components/chat/examples";
import { ArrowUpIcon, CircleIcon, Market0Icon, SimplePlusIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { WithToolbar } from "@/components/with-toolbar";
import { useScrollToBottom } from "@/hooks/chat/use-scroll-to-bottom";
import { examples } from "@/lib/examples";
import { cn } from "@/lib/utils";
import { ClientMessage } from "@/llm/types";
import { zodResolver } from "@hookform/resolvers/zod";

import Explanation from "../explanation/explanation";

const formSchema = z.object({
  message: z.string().min(2).max(200),
});

export default function Conversation() {
  const [containerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();
  const { readOnly, ownerProfile, setHasMessages } = useChat();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    disabled: readOnly,
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const input = values.message;
    form.reset();

    setConversation((currentConversation: ClientMessage[]) => [
      ...currentConversation,
      { id: generateId(), role: "user", display: input },
    ]);

    const message = await continueConversation(input);
    setConversation((currentConversation: ClientMessage[]) => [...currentConversation, message]);
    setHasMessages(true);
  }

  const onExampleClick = (input: string) => async () => {
    setConversation((currentConversation: ClientMessage[]) => [
      ...currentConversation,
      { id: generateId(), role: "user", display: input },
    ]);

    const message = await continueConversation(input);
    setConversation((currentConversation: ClientMessage[]) => [...currentConversation, message]);
    setHasMessages(true);
  };

  return (
    <main
      className="flex flex-row flex-1 overflow-hidden w-full mx-auto border-t border-gray-100"
      style={{ maxHeight: "calc(100vh - 56px)" }}
    >
      <div className="flex flex-col flex-no-wrap h-full overflow-y-auto overscroll-y-none gap-2 sm:gap-3 w-full pt-11 transition-all duration-300">
        <div className="flex-1 overflow-y-auto px-0 sm:px-9">
          <div
            id="conversation"
            ref={containerRef}
            className={cn("flex-1 min-w-0 mx-auto max-w-4xl px-3 sm:px-1", {
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
                  <WithToolbar>{message.display}</WithToolbar>
                </div>
              ) : null
            )}

            <div ref={messagesEndRef} className="w-full h-px" />
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 w-full px-3 sm:px-0">
                  {examples.map((example) => (
                    <button
                      key={example.id}
                      onClick={onExampleClick(example.message)}
                      className="bg-gray-100 text-sm font-light py-3 rounded-lg flex gap-3 items-center justify-between px-4 pl-5 sm:px-0 sm:pl-0 sm:justify-center hover:bg-gray-200/90 transition-all duration-300"
                    >
                      {example.title} <ArrowUpIcon />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="flex-shrink-1 min-w-0 min-h-0 bg-white max-w-4xl mx-auto w-full px-3 sm:px-1 h-fit">
            <div className="p-3 bg-white border border-gray-200 rounded-lg focus-within:ring-stone-700 focus-within:ring-2 transition-all duration-150">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-row justify-between gap-2 items-center"
                >
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="w-full space-y-0">
                        <FormControl>
                          <Input
                            autoFocus
                            autoComplete="off"
                            className="bg-white shadow-none border-0 focus-visible:ring-0 py-2 px-0 placeholder-slate-500/80 font-light"
                            placeholder="Start Typing..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {!form.formState.disabled && <Examples onExampleClick={onExampleClick} />}

                  <Button
                    disabled={!form.formState.isDirty || form.formState.disabled}
                    type="submit"
                    className="px-3 py-2 m-0 bg-black hover:bg-black text-white text-sm leading-6 font-light"
                  >
                    Send
                  </Button>
                </form>
              </Form>
            </div>
            {conversation.length > 0 && (
              <div className="relative px-2 py-2 text-center text-[11px] sm:text-xs font-light text-slate-500 md:px-[60px]">
                <span>Market0 is a demo app that showcases secure auth patterns for GenAI apps</span>
              </div>
            )}
            {conversation.length === 0 && (
              <div className="px-2 py-2 text-xs font-light text-slate-500 md:px-[60px] flex gap-2 items-center justify-center">
                <Link
                  href="https://www.okta.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-all duration-300"
                >
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link
                  href="https://www.okta.com/terms-of-service/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-all duration-300"
                >
                  Terms of Service
                </Link>
              </div>
            )}
          </div>
        )}

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
      <Explanation />
    </main>
  );
}
