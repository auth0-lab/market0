"use server";

import { aiState } from "@/lib/db";

export const getHistoryFromStore = async (id: string) => {
  return await aiState.get({ conversationID: id });
};
