import { generateId } from "ai";
import { redirect } from "next/navigation";

import { conversations } from "@/lib/db";
import { getUser } from "@/sdk/fga";
import { assignChatOwner } from "@/sdk/fga/chats";

export default async function Root() {
  const user = await getUser();
  const conversationID = await conversations.create({ ownerID: user.sub });
  await assignChatOwner(conversationID);
  redirect(`/chat/${conversationID}`);
}
