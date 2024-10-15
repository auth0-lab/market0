"use server";

import { conversations } from "@/lib/db";
import { getUser } from "@/sdk/fga";

/**
 *
 * Return the history for a conversation from the store
 *
 * @param id
 * @returns
 */
export const getHistoryFromStore = async (id: string) => {
  return await conversations.get({ conversationID: id });
};

export const listUserConversations = async () => {
  const user = await getUser();
  return await conversations.list({ ownerID: user.sub });
};
