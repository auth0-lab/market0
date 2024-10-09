"use server";

import { generateId } from "ai";
import React from "react";

import { fetchUserById } from "@/app/actions";
import { getAvatarFallback } from "@/components/auth0/user-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatUser } from "@/lib/db/chat-users";
import { getChatUsers } from "@/sdk/fga/chats";

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
  console.log("PermissionBlock", generateId());

  const { email } = user;
  let userInfo = {
    picture: "",
    name: email,
    given_name: email.split("")[0],
    family_name: email.split("")[1],
  };

  if (user.user_id) {
    userInfo = await fetchUserById(user.user_id);
  }

  const picture = userInfo?.picture;
  const name = userInfo?.name;
  const given_name = userInfo?.given_name;
  const family_name = userInfo?.family_name;

  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center justify-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={picture} alt={picture} />
          <AvatarFallback>{getAvatarFallback({ family_name, given_name })}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-left justify-between flex-grow">
          <span className="text-slate-800 font-medium">{name}</span>
          <span className="text-gray-600 text-sm">{email}</span>
        </div>
      </div>

      <UserPermissionActions user={user} />
    </li>
  );
}

export async function ChatUsersPermissionsList({ chatId }: ChatUsersPermissionsList) {
  console.log("PermissionsViewers", generateId());
  // render nothing if we are not in the context of a chat
  if (!chatId) {
    return null;
  }

  const viewers = await getChatUsers(chatId!);

  return (
    <div className="py-2 pt-5 border-t border-slate-200">
      <h2 className="text-sm font-normal mb-3">Who has access</h2>
      <div className="min-h-[150px] max-h-[240px] h-full rounded-md">
        <ul className="space-y-2">
          {viewers.map((user) => (
            <UserPermissionBlock key={generateId()} user={user} />
          ))}
        </ul>
      </div>
    </div>
  );
}
