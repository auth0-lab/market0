import { assignChatOwner } from "@/sdk/fga/chats";
import { generateId } from "ai";
import { redirect } from "next/navigation";

export default async function Root() {
  const conversationID = generateId();
  await assignChatOwner(conversationID);
  redirect(`/chat/${conversationID}`);
}
