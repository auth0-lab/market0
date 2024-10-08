"use client";

import { generateId } from "ai";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCopyToClipboard } from "@/hooks/chat/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { assignChatReader, getChatReaders, revokeChatReader } from "@/sdk/fga/chats";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, TrashIcon } from "@radix-ui/react-icons";

import { getAvatarFallback } from "../auth0/user-button";
import { CaretDownIcon, CircleCheckBigIcon, LinkIcon2, ShareIcon } from "../icons";
import Loader from "../loader";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
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
          <DropdownMenuContent className="text-sm">
            <DropdownMenuItem>
              <Link href="#" className="flex justify-start items-center gap-1 font-normal" onClick={() => void 0}>
                <CheckIcon /> Viewer
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Link
                href="#"
                className={cn("flex justify-start items-center gap-1 font-normal", {
                  "ps-5 disabled text-slate-400 cursor-not-allowed": true,
                })}
                onClick={() => void 0}
              >
                Editor
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Link
                href="#"
                className="flex justify-start items-center gap-1 font-normal text-destructive"
                onClick={() => onAccessRemoval(email)}
              >
                <TrashIcon />
                Remove access
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
};

const formSchema = z.object({
  user: z.string().email(),
  role: z.enum(["Viewer", "Editor"]),
});

export function ShareConversation({ user }: ShareConversationProps) {
  const { chatId } = useChat();

  const [viewers, setViewers] = useState<{ email?: string }[]>([]);
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
  const [isLoading, setIsLoading] = useState(true);
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
      await assignChatReader(chatId!, [email]);
      setViewers((prev) => [...prev, { email }]);
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

  async function handleOnRemove(email: string) {
    try {
      setIsWorking(true);
      await revokeChatReader(chatId!, [email]);
      setViewers((prev) => prev.filter((viewer) => viewer.email !== email));
    } catch (err) {
      toast({
        title: "Error!",
        description: (err as Error).message || "There was a problem removing access to this chat. Try again later.",
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

  // initial load of viewers
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
      } finally {
        setIsLoading(false);
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
    <Dialog onOpenChange={() => form.reset()}>
      <DialogTrigger asChild={true}>
        <Button className="bg-gray-100 text-slate-800 flex gap-2 items-center px-3 py-2 rounded-md shadow-none hover:ring-2 ring-[#CFD1D4] border-gray-100 text-sm hover:bg-gray-100 hover:text-black transition-all duration-300">
          <ShareIcon /> Share chat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Share this conversation with a friend
          </DialogTitle>
          <DialogDescription className="text-sm text-black/60">
            All conversations are private by default and only accessible to the owner. You can share your chat with
            friends or colleges by submitting their email and copying the link of this chat.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-row justify-between gap-2 items-start py-2">
            <FormField
              control={form.control}
              name="user"
              disabled={isWorking}
              render={({ field }) => (
                <FormItem className="w-full space-y-0">
                  <h2 className="flex text-sm font-normal mb-3" color="none">
                    Add people to this chat
                  </h2>

                  <div className="flex justify-between items-center flex-1 p-0 bg-white border border-gray-200 rounded-lg">
                    <FormControl>
                      <Input
                        autoFocus
                        data-1p-ignore
                        autoComplete="off"
                        className="bg-white shadow-none p-0 px-3 border-0 focus-visible:ring-0 placeholder-slate-500/80 text-base font-light h-6"
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
                              <SelectTrigger className="font-normal py-0 px-2 leading-3 border-none ring-0 focus:ring-0 shadow-none hover:bg-slate-100 rounded-l-none">
                                <SelectValue placeholder="Select role to for the user to share" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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

            <Button type="submit" variant="secondary" className="p-4 m-0 mt-8 text-sm leading-6">
              Share
            </Button>
          </form>
        </Form>

        <div className="py-2 pt-5 border-t border-slate-200">
          <h2 className="text-sm font-normal mb-3">Who has access</h2>
          <ScrollArea className="min-h-[150px] max-h-[240px] h-full rounded-md">
            <ul className="space-y-2">
              {isLoading && (
                <div className="mx-auto">
                  <Loader />
                </div>
              )}

              {!isLoading && (
                <PermissionBlock
                  picture={user.picture}
                  fallback={getAvatarFallback(user)}
                  name={user.name}
                  email={user.email}
                  role="Owner"
                />
              )}

              {!isLoading &&
                viewers.map(
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
