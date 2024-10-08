"use server";

import { getAIStateFromStore } from "@/lib/db";

export const getHistoryFromStore = async (id: string) => {
  return await getAIStateFromStore({ conversationID: id });
};
