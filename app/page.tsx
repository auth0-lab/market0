import { generateId } from "ai";
import { redirect } from "next/navigation";

export default function Root() {
  redirect(`/chat/${generateId()}`);
}
