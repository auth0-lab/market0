"use server";

import React from "react";

import { fetchUserById } from "@/app/actions";
import { getChatUsers } from "@/app/chat/[id]/actions";
import { getAvatarFallback } from "@/components/auth0/user-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatUser } from "@/lib/db/chat-users";

import { UserPermissionActions } from "./user-permission-actions";

import type { Claims } from "@auth0/nextjs-auth0";
export interface ShareConversationProps {
  user: Claims;
  chatId: string | undefined;
}

export interface ChatUsersPermissionsList {
  chatId: string | undefined;
}

interface UserPermissionBlockProps {
  user: ChatUser;
}

export async function UserPermissionBlock({ user }: UserPermissionBlockProps) {
  const { email } = user;

  // Default user profile stored chat_users table
  let userProfile = {
    picture: "",
    name: email,
    given_name: email.split("")[0],
    family_name: email.split("")[1],
  };

  if (user.user_id) {
    // embed user profile
    const userInfo = await fetchUserById(user.user_id);
    userProfile = { ...userProfile, ...userInfo };
  }

  const picture = userProfile?.picture;
  const name = userProfile?.name;
  const given_name = userProfile?.given_name;
  const family_name = userProfile?.family_name;

  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center justify-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={picture} alt={picture} />
          <AvatarFallback>{getAvatarFallback({ family_name, given_name })}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-left justify-between flex-grow">
          <span className="text-gray-800 text-sm font-normal">{name}</span>
          <span className="text-gray-400 text-sm">{email}</span>
        </div>
      </div>

      <UserPermissionActions user={user} />
    </li>
  );
}

export async function ChatUsersPermissionsList({ chatId }: ChatUsersPermissionsList) {
  // render nothing if we are not in the context of a chat
  if (!chatId) {
    return null;
  }

  const viewers = await getChatUsers(chatId!);

  return (
    <div className="py-2 pt-5 border-t border-slate-200 -mx-6 mt-5">
      <h2 className="text-sm font-normal mb-3 px-6">Who has access</h2>
      <ScrollArea className="min-h-[120px] sm:max-h-[180px] h-fit sm:h-[180px] rounded-md">
        <ul className="space-y-3 px-6">
          {viewers.map((user) => (
            <UserPermissionBlock key={user.id} user={user} />
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
