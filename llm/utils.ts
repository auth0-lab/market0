import { getMutableAIState } from "ai/rsc";

import { ServerMessage } from "./types";

/**
 *
 * This is a helper arround getMutableAIState to get
 * and update the history of the conversation.
 *
 * @returns
 */
export function getHistory() {
  const history = getMutableAIState();

  return {
    get: (): ServerMessage[] => {
      return history.get();
    },
    update: (content: string | string[] | ServerMessage | ServerMessage[], role: string = "assistant") => {
      let newMessages;

      if (Array.isArray(content)) {
        newMessages = content.map((c) => {
          if (typeof c === "object") {
            return c;
          }
          return {
            role,
            content: c,
          };
        });
      } else if (typeof content === "object") {
        newMessages = [content];
      } else {
        newMessages = [
          {
            role,
            content,
          },
        ];
      }

      history.done((messages: ServerMessage[]) => [
        ...messages,
        ...newMessages,
      ]);
    },
  };
}
