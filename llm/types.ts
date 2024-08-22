import { ReactNode } from "react";

import * as serialization from "@/llm/components/serialization";

export { Document } from "@langchain/core/documents";

export interface ServerMessage {
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
   * If true, this message should not be restored when recreating the UI
   */
  tempMessage?: boolean;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant" | "function";
  display: ReactNode;
}
