import { generateId } from "ai";
import { redirect } from "next/navigation";

import { conversations } from "@/lib/db";
import { getUser } from "@/sdk/fga";

export default async function Root() {
  const user = await getUser();
  const conversationID = await conversations.create({ owner: user });
  redirect(`/chat/${conversationID}`);
}
