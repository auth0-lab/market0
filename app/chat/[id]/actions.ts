"use server";

import { chatUsers, conversations } from "@/lib/db";
import { ChatUserAccess } from "@/lib/db/chat-users";

import { fgaClient, getUser, withFGA } from "../../../sdk/fga";
import { withCheckPermission } from "../../../sdk/fga/next/with-check-permission";

const MAX_CHAT_READERS = process.env.MAX_CHAT_READERS ? parseInt(process.env.MAX_CHAT_READERS, 10) : 5;

/**
 *
 * This function wraps a Next.js Action to check if the user is the owner of the conversation.
 *
 * @param wrapped - Next.js Action to wrap
 * @returns - Wrapped Next.js Action
 */
const withCheckChatOwnership = <R>(wrapped: (id: string, ...rest: any) => Promise<R>) => withCheckPermission({
  checker: async (chatId: string) => {
    return withFGA({
      relation: "owner",
      object: `chat:${chatId}`,
    });
  },
  onUnauthorized: () => { throw new Error("You are not authorized.") },
}, wrapped);

/**
 * This function returns the list of users that have access to the chat.
 * It can only be called by the owner.
 */
export const getChatUsers = withCheckChatOwnership(
  async (chatId: string, { access }: { access?: ChatUserAccess } = {}) => {
    return await chatUsers.list(chatId, { access });
  }
);

/**
 * This function adds users to the chat.
 * It can only be called by the owner.
 */
export const addChatReader = withCheckChatOwnership(
  async (chatId: string, emails: string[]) => {
    const readers = await chatUsers.list(chatId, { access: "can_view" });
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
);

/**
 * This function removes a user from the chat.
 * It can only be called by the owner.
 */
export const removeChatReader = withCheckChatOwnership(async (chat_id: string, id: string) => {
  const chatUser = await chatUsers.get(id);

  if (!chatUser) {
    return;
  }

  await chatUsers.remove(chatUser.id);

  if (chatUser.user_id) {
    await fgaClient.deleteTuples([
      {
        user: `user:${chatUser.user_id}`,
        relation: "can_view",
        object: `chat:${chat_id}`,
      },
    ]);
  }
});

/**
 * This function checks if the current user is invited to the chat.
 * ie. not yet a reader
 */
export const isCurrentUserInvitedToChat = async (chatId: string) => {
  const user = await getUser();
  const chatUser = await chatUsers.getByUserEmail(chatId, user.email);
  return !!chatUser;
};

/**
 * Assigns the current user as a reader of the chat.
 * It can only be called by an invited user.
 */
export const setCurrentUserAsReader = async (chatId: string) => {
  if (!(await isCurrentUserInvitedToChat(chatId))) {
    throw new Error("You do not have permission to view this chat.");
  }
  const user = await getUser();
  await fgaClient.writeTuples([
    {
      user: `user:${user.sub}`,
      relation: "can_view",
      object: `chat:${chatId}`,
    },
  ]);
  await chatUsers.updateByUserEmail(
    chatId,
    user.email,
    { user_id: user.sub, status: "provisioned" }
  );
};

/**
 * Change the visibility of the chat.
 */
export const changeChatVisibility = withCheckChatOwnership(async (chatId: string, isPublic: boolean) => {
  try {
    await fgaClient[isPublic ? 'writeTuples' : 'deleteTuples']([
      {
        user: `user:*`,
        relation: "can_view",
        object: `chat:${chatId}`,
      },
    ]);
  } catch (err) {
    console.error(err);
  }
  const { sub } = await getUser();
  await conversations.save({ id: chatId, ownerID: sub, isPublic });
});

/**
 * Check if the chat is public.
 */
export const isChatPublic = withCheckChatOwnership(async (chatId: string) => {
  const { allowed } = await fgaClient.check({
    user: "user:*",
    relation: "can_view",
    object: `chat:${chatId}`,
  });
  return !!allowed;
});

/**
 * Check if the current user is the owner of the chat.
 */
export const isChatOwner = async function (chatId: string) {
  const user = await getUser();
  if (!user) { return false; }
  const { allowed } = await fgaClient.check({
    user: `user:${user.sub}`,
    relation: "owner",
    object: `chat:${chatId}`,
  });
  return !!allowed;
};
