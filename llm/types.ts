import { ReactNode } from "react";

import * as serialization from "@/llm/components/serialization";

export { Document } from "@langchain/core/documents";

export interface ServerMessage {
  /**
   * Optional id for the message.
   * Make it easier to find the message in the UI and swap history.
   */
  id?: string;

  role: "user" | "assistant" | "system" | "tool";
  content: string | object;

  /**
   * The name of the component to render when recreating the UI from DB
   *
   * use serialization.names.get(ComponentName)!
   */
  componentName?: keyof typeof serialization.components;

  /**
   * The parameters to pass to the component.
   */
  params?: object;

  /**
   * If true, this message should not be shown in the UI.
   */
  hidden?: boolean;
}

export interface Conversation {
  messages: ServerMessage[];
  ownerID: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant" | "function";
  display: ReactNode;
}
