"use client";

import { generateId } from "ai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useCopyToClipboard } from "@/hooks/chat/use-copy-to-clipboard";
import { zodResolver } from "@hookform/resolvers/zod";

import { getAvatarFallback } from "../auth0/user-button";
import { LinkIcon, ShareIcon } from "../icons";
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
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
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
}

const PermissionBlock = ({
  picture,
  fallback,
  name,
  email,
  role = "Viewer",
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
      <span className="text-slate-400">{role}</span>
    </li>
  );
};

const formSchema = z.object({
  value: z.string().min(2).max(200),
});

export function ShareConversation({ user }: ShareConversationProps) {
  const { chatId } = useChat();

  // render nothing if we are not in the context of a chat
  if (!chatId) {
    return null;
  }

  const [viewers, setViewers] = useState<string[]>([]);
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const input = values.value;
    form.reset();

    // manage state and add people to chat
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
        // const newViewers = await getChatViewers(chat);
        // setViewers(() => [...newViewers]);
      } catch (error) {
        console.error(error);
      }
    }

    retrieveViewers();
  }, [viewers]);

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
            All conversations are private by default and only accessible to the
            owner. You can share your chat with friends or colleges by adding
            their email and copying the link to this chat
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-row justify-between gap-2 items-center py-2"
          >
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem className="w-full space-y-0">
                  <FormControl>
                    <Input
                      autoFocus
                      autoComplete="off"
                      className="bg-white shadow-none focus-visible:ring-0 p-4 placeholder-slate-500/80 text-base font-light"
                      placeholder="Add people by email"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              disabled={!form.formState.isDirty}
              type="submit"
              className="px-4 py-4 m-0 bg-indigo-600 hover:bg-indigo-500 text-white text-sm leading-6 font-light"
            >
              Add
            </Button>
          </form>
        </Form>

        <div className="py-2">
          <h2 className="text-md font-semibold text-gray-900 leading-6 mb-2">
            People with access
          </h2>
          <ScrollArea className={`h-[300px] rounded-md border-y p-4`}>
            <ul className="space-y-2">
              <PermissionBlock
                picture={user.picture}
                fallback={getAvatarFallback(user)}
                name={user.name}
                email={user.email}
                role="Owner"
              />
              {[
                "damian@auth0.com",
                "den@auth0.com",
                "jose@auth0.com",
                "iaco@auth0.com",
                "jared@okta.com",
                "javier.centurion@okta.com",
              ].map((email) => (
                <PermissionBlock
                  key={generateId()}
                  name={email}
                  email={email}
                  fallback={getAvatarFallback({
                    family_name: email[1],
                    given_name: email[0],
                  })}
                  role="Viewer"
                />
              ))}
            </ul>
          </ScrollArea>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            className="flex gap-2 items-center"
            variant="secondary"
            disabled={isCopied}
            onClick={() => copyText(window.location.href)}
          >
            <LinkIcon />
            {isCopied ? "Copied!" : "Copy Link"}
          </Button>
          <DialogClose asChild>
            <Button type="button">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
