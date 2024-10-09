"use client";

import { generateId } from "ai";
import { CheckIcon, TrashIcon } from "lucide-react";
import React, { useEffect } from "react";

import { ChatUser } from "@/lib/db/chat-users";
import { cn } from "@/lib/utils";
import { removeChatUser } from "@/sdk/fga/chats";

import { CaretDownIcon } from "../icons";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "../ui/use-toast";

import type { Claims } from "@auth0/nextjs-auth0";
export interface ShareConversationProps {
  user: Claims;
  chatId: string | undefined;
}

interface PermissionActionsProps {
  user: ChatUser;
}

export function PermissionActions({ user }: PermissionActionsProps) {
  const { id } = user;
  const role = user.access === "can_view" ? "Viewer" : "Owner";

  async function handleOnRemove() {
    try {
      await removeChatUser(id);
    } catch (err) {
      toast({
        title: "Error!",
        description: (err as Error).message || "There was a problem removing access to this chat. Try again later.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    console.log("PermissionActions", generateId());
  }, []);

  return (
    <>
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
              <button className="flex justify-start items-center gap-1 font-normal">
                <CheckIcon /> Viewer
              </button>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <button
                className={cn("flex justify-start items-center gap-1 font-normal", {
                  "ps-5 disabled text-slate-400 cursor-not-allowed": true,
                })}
              >
                Editor
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <button
                className="flex justify-start items-center gap-1 font-normal text-destructive"
                onClick={handleOnRemove}
              >
                <TrashIcon />
                Remove access
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
