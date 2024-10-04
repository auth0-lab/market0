"use client";

import { generateId } from "ai";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCopyToClipboard } from "@/hooks/chat/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { assignChatReader, getChatReaders, revokeChatReader } from "@/sdk/fga/chats";
import { zodResolver } from "@hookform/resolvers/zod";

import { getAvatarFallback } from "../auth0/user-button";
import { CaretDownIcon, CircleCheckBigIcon, LinkIcon2, ShareIcon } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "../ui/use-toast";
import { useChat } from "./context";

import type { Claims } from "@auth0/nextjs-auth0";
export interface ShareConversationProps {
  user: Claims;
}

interface PermissionBlockProps {
  picture?: string;
  fallback: string;
  name: string;
  email: string;
  role: string;
  onAccessRemoval?: (email: string) => void;
}

const PermissionBlock = ({
  picture,
  fallback,
  name,
  email,
  role = "Viewer",
  onAccessRemoval = () => void 0,
}: PermissionBlockProps) => {
  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center justify-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={picture} alt={picture} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-left justify-between flex-grow">
          <span className=" text-slate-800 font-medium">{name}</span>
          <span className="text-gray-600 text-sm">{email}</span>
        </div>
      </div>
      {role === "Owner" && (
        <Button variant="ghost" className="font-normal">
          <span className="text-slate-400">{role}</span>
        </Button>
      )}
      {role === "Viewer" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="font-normal">
              <span className="text-slate-400">{role}</span>
              <CaretDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Button variant="link" className="font-normal" onClick={() => onAccessRemoval(email)}>
                Remove access
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
};

const formSchema = z.object({
  readerEmail: z.string().email(),
});

export function ShareConversation({ user }: ShareConversationProps) {
  const { chatId } = useChat();

  const [viewers, setViewers] = useState<{ email?: string }[]>([]);
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      readerEmail: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const email = values.readerEmail;

    try {
      await assignChatReader(chatId!, [email]);
      setViewers((prev) => [...prev, { email }]);
      form.reset();
    } catch (err) {
      toast({
        title: "Error!",
        description: (err as Error).message || "There was a problem sharing this chat. Try again later.",
        variant: "destructive",
      });
    }
  }

  async function handleOnRemove(email: string) {
    try {
      await revokeChatReader(chatId!, [email]);
      setViewers((prev) => prev.filter((viewer) => viewer.email !== email));
    } catch (err) {
      toast({
        title: "Error!",
        description: (err as Error).message || "There was a problem removing access to this chat. Try again later.",
        variant: "destructive",
      });
    }
  }

  async function copyText(text: string) {
    try {
      await copyToClipboard(text);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    async function retrieveViewers() {
      try {
        const retrievedViewers = await getChatReaders(chatId!);
        setViewers(() => [...retrievedViewers]);
      } catch (err) {
        toast({
          title: "Error!",
          description: (err as Error).message || "There was a problem retrieving chat readers. Try again later.",
          variant: "destructive",
        });
      }
    }

    if (chatId) {
      retrieveViewers();
    }
  }, [chatId]);

  // render nothing if we are not in the context of a chat
  if (!chatId) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild={true}>
        <Button className="bg-gray-100 text-slate-800 flex gap-2 items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100 hover:text-black transition-colors duration-300">
          <ShareIcon /> Share chat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Share this conversation with a friend
          </DialogTitle>
          <DialogDescription>
            All conversations are private by default and only accessible to the owner. You can share your chat with
            friends or colleges by submitting their email and copying the link of this chat
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-row justify-between gap-2 items-center py-2"
          >
            <FormField
              control={form.control}
              name="readerEmail"
              render={({ field }) => (
                <FormItem className="w-full space-y-0">
                  <FormControl>
                    <Input
                      autoFocus
                      data-1p-ignore
                      autoComplete="off"
                      className="bg-white shadow-none focus-visible:ring-0 p-4 placeholder-slate-500/80 text-base font-light"
                      placeholder="Share by email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={!form.formState.isDirty}
              type="submit"
              variant="secondary"
              className="px-4 py-4 m-0 text-sm leading-6 font-light"
            >
              Share
            </Button>
          </form>
        </Form>

        <div className="py-2">
          <h2 className="text-md font-semibold text-gray-900 leading-6 mb-2">Who has access</h2>
          <ScrollArea className="min-h-[150px] max-h-[240px] h-full rounded-md p-4">
            <ul className="space-y-2">
              <PermissionBlock
                picture={user.picture}
                fallback={getAvatarFallback(user)}
                name={user.name}
                email={user.email}
                role="Owner"
              />
              {viewers.map(
                ({ email }) =>
                  email && (
                    <PermissionBlock
                      key={generateId()}
                      name={email}
                      email={email}
                      fallback={getAvatarFallback({
                        family_name: email[1],
                        given_name: email[0],
                      })}
                      role="Viewer"
                      onAccessRemoval={(email) => handleOnRemove(email)}
                    />
                  )
              )}
            </ul>
          </ScrollArea>
        </div>

        <DialogFooter className="flex gap-1">
          <Button
            className={cn("flex gap-2 items-center flex-1", {
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
          <DialogClose asChild>
            <Button type="button" variant="default" className="flex-1">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
