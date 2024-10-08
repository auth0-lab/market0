"use server";

import { ConsistencyPreference } from "@openfga/sdk";

import { fgaClient, getUser } from "./";

const MAX_CHAT_READERS = process.env.MAX_CHAT_READERS ? parseInt(process.env.MAX_CHAT_READERS, 10) : 5;

export async function assignChatOwner(chatId: string) {
  const user = await getUser();
  await fgaClient.writeTuples([
    {
      user: `user:${user.email}`,
      relation: "owner",
      object: `chat:${chatId}`,
    },
  ]);
}

export async function getChatReaders(chatId: string) {
  const { $response } = await fgaClient.read(
    {
      object: `chat:${chatId}`,
      relation: "can_view",
    },
    {
      consistency: ConsistencyPreference.HigherConsistency,
    }
  );

  return $response.data.tuples.map((t) => ({
    email: t.key.user.replace("user:", ""),
  }));
}

export async function assignChatReader(chatId: string, emails: string[]) {
  const readers = await getChatReaders(chatId);
  const filteredEmails = emails.filter((email) => !readers.some((reader) => reader.email === email.toLowerCase()));

  if (readers.length + filteredEmails.length > MAX_CHAT_READERS) {
    throw new Error(
      `You have reached the limit (${MAX_CHAT_READERS}) on the number of users that can access to this chat.`
    );
  }

  await fgaClient.writeTuples(
    filteredEmails.map((email) => ({
      user: `user:${email.toLowerCase()}`,
      relation: "can_view",
      object: `chat:${chatId}`,
    }))
  );
}

export async function revokeChatReader(chatId: string, emails: string[]) {
  await fgaClient.deleteTuples(
    emails.map((email) => ({
      user: `user:${email.toLowerCase()}`,
      relation: "can_view",
      object: `chat:${chatId}`,
    }))
  );
}
