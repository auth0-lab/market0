"use server";

import { generateId } from "ai";
import React from "react";

import { fetchUserById } from "@/app/actions";
import { ChatUser } from "@/lib/db/chat-users";

import { getAvatarFallback } from "../auth0/user-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PermissionActions } from "./permission-actions";

import type { Claims } from "@auth0/nextjs-auth0";
export interface ShareConversationProps {
  user: Claims;
  chatId: string | undefined;
}

interface PermissionBlockProps {
  user: ChatUser;
}

export async function PermissionBlock({ user }: PermissionBlockProps) {
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
          <span className=" text-slate-800 font-medium">{name}</span>
          <span className="text-gray-600 text-sm">{email}</span>
        </div>
      </div>

      <PermissionActions user={user} />
    </li>
  );
}
