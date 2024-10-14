"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCopyToClipboard } from "@/hooks/chat/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { addChatUsers } from "@/sdk/fga/chats";
import { zodResolver } from "@hookform/resolvers/zod";

import { ArrowRightIcon, CircleCheckBigIcon, LinkIcon2, ShareIcon, ShareMenuIcon } from "../icons";
import Loader from "../loader";
import { Button, ButtonProps } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useToast } from "../ui/use-toast";
import { useChat } from "./context";

export interface ShareConversationProps {
  children?: React.ReactNode;
}

const formSchema = z.object({
  user: z.string().email(),
  role: z.enum(["Viewer", "Editor"]),
});

const ShareButton = React.forwardRef<HTMLButtonElement & HTMLAnchorElement, ButtonProps>((props, ref) => {
  const { disabled, className, ...rest } = props;
  return (
    <Button
      ref={ref}
      className={cn(
        // common styles
        "flex items-center text-slate-800 shadow-none font-normal bg-transparent hover:bg-transparent h-full w-full",
        // button navbar styles (desktop)
        "sm:text-sm sm:bg-gray-100 sm:hover:bg-gray-100 sm:border-gray-100 sm:ring-[#CFD1D4] sm:hover:ring-2 sm:rounded-md hover:text-black sm:transition-all sm:duration-300",
        "sm:justify-center sm:px-3 sm:py-2 ",
        // collapsible navbar link styles (mobile)
        "justify-between px-5 py-3",
        // disabled styles
        { "disabled opacity-50 cursor-not-allowed": disabled },
        // additional styles provided by user
        className
      )}
      {...rest}
    >
      {/** As button (desktop) */}

      <div className="hidden sm:flex items-center gap-2">
        <ShareIcon />
        Share chat
      </div>

      {/** As collapsible navbar link (mobile) */}

      <div className="flex sm:hidden items-center gap-4">
        <ShareMenuIcon />
        Share Chat
      </div>

      <span className="inline-flex sm:hidden">
        <ArrowRightIcon />
      </span>
    </Button>
  );
});

ShareButton.displayName = "ShareButton";

const TooltipWrapper = ({ message, children }: { message: string; children: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <Tooltip disableHoverableContent={true}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function ShareConversation({ children }: ShareConversationProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
  const { chatId, hasMessages, readOnly } = useChat();
  const [isWorking, setIsWorking] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: "",
      role: "Viewer",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const email = values.user;

    try {
      setIsWorking(true);
      await addChatUsers(chatId!, [email]);
      form.reset();
    } catch (err) {
      toast({
        title: "Error!",
        description: (err as Error).message || "There was a problem sharing this chat. Try again later.",
        variant: "destructive",
      });
    } finally {
      setIsWorking(false);
    }
  }

  async function copyText(text: string) {
    try {
      await copyToClipboard(text);
    } catch (error) {
      console.error(error);
    }
  }

  // render nothing if we are not in the context of a chat
  // additionally, if the chat is read-only, we should not
  // render the share button
  if (!chatId || readOnly) {
    return null;
  }

  // doesn't make sense to share a chat without messages
  if (!hasMessages) {
    return (
      <TooltipWrapper message="Start a conversation before sharing!">
        <ShareButton disabled={!hasMessages} />
      </TooltipWrapper>
    );
  }

  return (
    <Dialog onOpenChange={() => form.reset()}>
      <DialogTrigger asChild>
        <ShareButton />
      </DialogTrigger>
      <DialogContent className={cn("h-full flex flex-col sm:h-auto sm:fixed", "rounded-none shadow-none")}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 text-left">
            Share this conversation with a friend
          </DialogTitle>
          <DialogDescription className="text-sm text-black/60 text-left">
            All conversations are private by default and only accessible to the owner. You can share your chat with
            friends or colleges by submitting their email and copying the link of this chat.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-row justify-between gap-2 items-start pt-2"
            >
              <FormField
                control={form.control}
                name="user"
                disabled={isWorking}
                render={({ field }) => (
                  <FormItem className="w-full space-y-0">
                    <h2 className="flex text-sm font-normal mb-3" color="none">
                      Add people to this chat
                    </h2>

                    <div className="flex justify-between items-center flex-1 p-0 bg-white border border-gray-200 rounded-md focus-within:ring-stone-700 focus-within:ring-2 transition-all duration-150">
                      <FormControl>
                        <Input
                          autoFocus
                          data-1p-ignore
                          autoComplete="off"
                          className="bg-white shadow-none p-0 px-3 border-0 focus-visible:ring-0 placeholder-slate-500/80 text-base font-light h-6 placeholder:text-sm"
                          placeholder="Share by email"
                          {...field}
                        />
                      </FormControl>

                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="font-normal py-0 px-2 leading-3 border-none ring-0 focus:ring-0 shadow-none hover:bg-slate-100 rounded-l-none max-h-[34px]">
                                  <SelectValue placeholder="Select role to for the user to share" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent align="end">
                                <SelectItem value="Viewer">can view</SelectItem>
                                <SelectItem value="Editor" disabled>
                                  can edit
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormMessage className="ps-3 pt-2" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="secondary"
                className="p-4 m-0 mt-8 text-sm leading-6 hover:ring-2 ring-[#CFD1D4] border-gray-100 hover:bg-gray-100 hover:text-black transition-all duration-300 min-w-[72px] flex items-center"
              >
                {isWorking ? <Loader className="ml-4 mt-1" /> : "Share"}
              </Button>
            </form>
          </Form>

          {children}
        </div>

        <DialogFooter className="flex gap-1 h-10">
          <Button
            className={cn("flex gap-2 items-center flex-1 h-full disabled:opacity-100", {
              "text-teal-600": isCopied,
            })}
            variant="outline"
            disabled={isCopied}
            onClick={() => copyText(window.location.href)}
          >
            {isCopied && (
              <>
                <CircleCheckBigIcon /> Copied
              </>
            )}
            {!isCopied && (
              <>
                <LinkIcon2 />
                Copy Link
              </>
            )}
          </Button>
          <DialogClose asChild className="hidden sm:inline-block">
            <Button type="button" variant="default" className="flex-1 h-full">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
