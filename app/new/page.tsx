import { generateId } from "ai";
import { redirect } from "next/navigation";

import { assignChatOwner } from "@/sdk/fga/chats";

export default async function Root() {
  const conversationID = generateId();
  await assignChatOwner(conversationID);
  redirect(`/chat/${conversationID}`);
}
