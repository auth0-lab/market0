"use server";

import { generateId } from "ai";
import React from "react";

import { getChatUsers } from "@/sdk/fga/chats";

import { PermissionBlock } from "./permission-block";

export interface PermissionsViewersProps {
  chatId: string | undefined;
}

export async function PermissionsViewers({ chatId }: PermissionsViewersProps) {
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
            <PermissionBlock key={generateId()} user={user} />
          ))}
        </ul>
      </div>
    </div>
  );
}
