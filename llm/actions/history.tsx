"use server";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";

import { getAIState } from "@/lib/db";
import { getUser } from "@/sdk/fga";

import { ServerMessage } from "../types";

export const getHistory = async (id: string) => {
  let messages: ServerMessage[] = [];
  // const user = await getUser();

  // if (user) {
  //   messages = await getAIState({
  //     conversationID: id,
  //     userID: user.sub
  //   });
  // }

  return await getAIState({ conversationID: id });
};
