"use client";

import Conversation from "@/components/chat/conversation";
import { ObservableProvider } from "@/components/explanation/observable";

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export default function Page() {
  return (
    <ObservableProvider>
      <Conversation />
    </ObservableProvider>
  );
}
