"use server";

import { aiState } from "@/lib/db";
import { getUser } from "@/sdk/fga";

/**
 *
 * Return the history for a conversation from the store
 *
 * @param id
 * @returns
 */
export const getHistoryFromStore = async (id: string) => {
  return await aiState.get({ conversationID: id });
};


export const listConversations = async () => {
  const user = await getUser();
  return await aiState.list({ownerID: user.sub});
};
