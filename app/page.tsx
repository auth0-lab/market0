import { redirect } from "next/navigation";

import WelcomeScreen from "@/components/welcome/Welcome";
import { conversations } from "@/lib/db";
import { getUser } from "@/sdk/fga";

export default async function Root() {
  const user = await getUser();
  if (!user) {
    return <WelcomeScreen />;
  }
  const conversationID = await conversations.create({ owner: user });
  redirect(`/chat/${conversationID}`);
}
