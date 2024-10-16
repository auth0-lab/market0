"use server";

import { conversations } from "@/lib/db";
import { getUser } from "@/sdk/fga";

export const listUserConversations = async () => {
  const user = await getUser();
  return await conversations.list({ ownerID: user.sub });
};
