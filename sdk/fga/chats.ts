"use server";

import { chatUsers } from "@/lib/db";
import { ChatUserAccess } from "@/lib/db/chat-users";

import { fgaClient, getUser } from "./";

const MAX_CHAT_READERS = process.env.MAX_CHAT_READERS ? parseInt(process.env.MAX_CHAT_READERS, 10) : 5;

export async function getChatUsers(chatId: string, { access }: { access?: ChatUserAccess } = {}) {
  return await chatUsers.list(chatId, { access });
}

export async function addChatUsers(chatId: string, emails: string[]) {
  const readers = await getChatUsers(chatId, { access: "can_view" });
  const filteredEmails = emails.filter((email) => !readers.some((reader) => reader.email === email.toLowerCase()));

  if (readers.length + filteredEmails.length > MAX_CHAT_READERS) {
    throw new Error(
      `You have reached the limit (${MAX_CHAT_READERS}) on the number of users that can access to this chat.`
    );
  }

  return await Promise.all(
    filteredEmails.map((email) => chatUsers.add({ chat_id: chatId, email, access: "can_view" }))
  );
}

export async function removeChatUser(id: string) {
  const chatUser = await chatUsers.get(id);
  if (!chatUser) {
    return;
  }

  await chatUsers.remove(id);

  if (chatUser.user_id) {
    await fgaClient.deleteTuples([
      {
        user: `user:${chatUser.user_id}`,
        relation: "can_view",
        object: `chat:${chatUser.chat_id}`,
      },
    ]);
  }
}

export async function isUserInvitedToChat(chatId: string) {
  const user = await getUser();
  const chatUser = await chatUsers.getByUserEmail(chatId, user.email);
  return !!chatUser;
}

export async function assignChatOwner(chatId: string) {
  const user = await getUser();
  await fgaClient.writeTuples([
    {
      user: `user:${user.sub}`,
      relation: "owner",
      object: `chat:${chatId}`,
    },
  ]);
  await chatUsers.add({
    chat_id: chatId,
    user_id: user.sub,
    email: user.email,
    access: "owner",
    status: "provisioned",
  });
}

export async function assignChatReader(chatId: string) {
  const user = await getUser();
  await fgaClient.writeTuples([
    {
      user: `user:${user.sub}`,
      relation: "can_view",
      object: `chat:${chatId}`,
    },
  ]);
  await chatUsers.updateByUserEmail(chatId, user.email, { user_id: user.sub, status: "provisioned" });
}

export async function isChatOwner(chatId: string) {
  const user = await getUser();
  const { allowed } = await fgaClient.check({
    user: `user:${user.sub}`,
    relation: "owner",
    object: `chat:${chatId}`,
  });
  return !!allowed;
}
