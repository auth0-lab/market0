"use client";

import { generateId } from "ai";
import { useActions, useUIState } from "ai/rsc";
import Link from "next/link";
import { use, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useChat } from "@/components/chat/context";
import { ArrowUpIcon, ChevronRightIcon, CircleIcon, Market0Icon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useScrollAnchor } from "@/hooks/chat/use-scroll-anchor";
import { examples, menuItems } from "@/lib/examples";
import { cn } from "@/lib/utils";
import { ClientMessage } from "@/llm/types";
import { useUser } from "@auth0/nextjs-auth0/client";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  message: z.string().min(2).max(200),
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export default function Chat({ params }: { params: { id: string } }) {
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();
  const { user } = useUser();
  const { scrollRef, messagesRef, visibilityRef } = useScrollAnchor();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
  }

  const onExampleClick = (input: string) => async () => {
    setConversation((currentConversation: ClientMessage[]) => [
      ...currentConversation,
      { id: generateId(), role: "user", display: input },
    ]);

    const message = await continueConversation(input);
    setConversation((currentConversation: ClientMessage[]) => [...currentConversation, message]);
  };

  return (
    <main className="flex overflow-hidden h-full  mx-auto pt-4" style={{ maxHeight: "calc(100vh - 56px)" }}>
      <div className="h-full w-full overflow-hidden rounded-md">
        <div ref={scrollRef} className="flex flex-col flex-no-wrap h-full overflow-y-auto overscroll-y-none">
          <div
            ref={messagesRef}
            className={cn("flex-1 min-w-0 max-w-4xl mx-auto w-full pb-[100px]", { hidden: conversation.length === 0 })}
          >
            {conversation.map((message: ClientMessage) =>
              message.role === "user" ? (
                <div key={message.id} className="flex flex-row gap-3 py-3 items-center justify-end">
                  <div className="relative max-w-[70%] text-base text-stone-600 font-light bg-[#F4F4F4] rounded-full px-5 py-2.5">
                    {message.display}
                  </div>
                  <div className="border rounded-full h-8 w-8 min-w-8 flex items-center justify-center">
                    <Avatar className="h-full w-full rounded-full">
                      <AvatarImage src={user?.picture!} alt={user?.nickname!} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ) : message.role === "assistant" || message.role === "function" ? (
                <div key={message.id} className="flex flex-row gap-3 py-3">
                  <div className="border rounded-full h-8 w-8 min-w-8 flex items-center justify-center">
                    <Market0Icon />
                  </div>
                  <div className="w-full font-light text-stone-600 flex items-center">{message.display}</div>
                </div>
              ) : null
            )}
            <div ref={visibilityRef} className="w-full h-px" />
          </div>
          {conversation.length === 0 && (
            <div className="flex flex-col gap-80 max-w-4xl mx-auto w-full mb-5 mt-auto">
              <div className="min-w-0 min-h-0 w-full flex flex-col items-center gap-6">
                <Market0Icon />
                <h1 className="text-6xl tracking-tight leading-[72px]">
                  Welcome to{" "}
                  <span className="bg-text-gradient bg-clip-text" style={{ WebkitTextFillColor: "transparent" }}>
                    Market0
                  </span>
                </h1>
                <p className="text-base tracking-wide text-slate-500 font-light leading-6">
                  Market0 is a demo app that showcases secure auth patterns for GenAI apps
                </p>
              </div>
              <div className="w-full">
                <div className="flex flex-col gap-5 items-center mb-5">
                  <CircleIcon />
                  <span className="text-slate-500 text-sm font-light">Get started with these examples</span>
                </div>
                <div className="grid grid-cols-3 gap-4 w-full">
                  {examples.map((example) => (
                    <button
                      key={example.id}
                      onClick={onExampleClick(example.message)}
                      className="bg-gray-100 text-sm font-light py-3 rounded-lg flex gap-3 items-center justify-center hover:bg-gray-200/90 transition-all duration-300"
                    >
                      {example.title} <ArrowUpIcon />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="sticky bottom-0 flex-shrink-0 min-w-0 min-h-0 bg-white max-w-4xl mx-auto w-full">
            <div className="p-4 py-3 bg-white border border-gray-200 rounded-lg focus-within:ring-stone-700 focus-within:ring-2 transition-all duration-150">
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
                            className="bg-white shadow-none border-0 focus-visible:ring-0 py-2 px-0 placeholder-slate-500/80 text-base font-light"
                            placeholder="Start Typing..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {!form.formState.disabled && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex flex-row gap-2 text-black text-sm leading-6 bg-gray-100 border-none px-3 py-2 focus-visible:ring-0 hover:bg-gray-200/90 transition-all duration-300 shadow-none font-light"
                        >
                          Examples
                          <ChevronRightIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-96 p-0" align="end" sideOffset={8}>
                        <DropdownMenuGroup>
                          {menuItems.map((menuItem, idx) => (
                            <DropdownMenuItem
                              key={menuItem.id}
                              onClick={onExampleClick(menuItem.message)}
                              className={cn(
                                "cursor-pointer px-4 py-3 focus:bg-gray-50 rounded-none",
                                idx < menuItems.length - 1 && "border-b border-gray-900/5"
                              )}
                            >
                              <div className="flex flex-row items-center w-full gap-4">
                                {menuItem.icon}
                                <span className="text-sm text-gray-900 leading-6">{menuItem.message}</span>
                              </div>
                              <ArrowUpIcon />
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

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
              <div className="relative px-2 py-2 text-center text-xs font-light text-slate-500 md:px-[60px]">
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
        </div>
      </div>
    </main>
  );
}
