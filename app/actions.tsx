"use server";

import { generateId } from "ai";
import { createAI, getAIState } from "ai/rsc";

import { saveAIState } from "@/lib/db";
import { confirmPurchase } from "@/llm/actions/confirm-purchase";
import { continueConversation } from "@/llm/actions/continue-conversation";
import {
  checkEnrollment,
  enrollToForecasts,
} from "@/llm/actions/forecast-enrollment";
import { createGoogleTask } from "@/llm/actions/reminders";
import * as serialization from "@/llm/components/serialization";
import { ClientMessage, ServerMessage } from "@/llm/types";
import { assignChatOwner, getUser } from "@/sdk/fga";

type Props = Parameters<
  ReturnType<typeof createAI<ServerMessage[], ClientMessage[]>>
>[0] & {
  conversationID: string;
};

export const AI = (p: Props) => {
  const { conversationID, ...params } = p;

  const C = createAI<ServerMessage[], ClientMessage[]>({
    actions: {
      continueConversation,
      confirmPurchase,
      createGoogleTask,
      checkEnrollment,
      enrollToForecasts,
    },
    onSetAIState: async ({ state, done }) => {
      "use server";

      if (done) {
        const user = await getUser();
        await saveAIState({
          conversationID,
          messages: state,
          userID: user.sub,
        });

        const isNewConversation = state.length <= 2;
        if (isNewConversation) {
          await assignChatOwner(conversationID);
        }
      }
    },
    // @ts-ignore
    onGetUIState: async () => {
      "use server";

      const history: readonly ServerMessage[] =
        getAIState() as readonly ServerMessage[];

      return history
        .filter((c) => {
          const isTempMessage = c.role === "assistant" && c.tempMessage;
          return !isTempMessage && c.role !== "system";
        })
        .map(({ role, content, componentName, params }) => {
          if (componentName) {
            const Component = serialization.components[componentName];
            if (Component) {
              return {
                id: generateId(),
                role,
                display: (
                  // @ts-ignore
                  // this one is complicated to fix, but it's not a big deal
                  <Component {...(params as Parameters<typeof Component>[0])} />
                ),
              };
            }
          }

          return {
            id: generateId(),
            role,
            display: content,
          };
        });
    },
  });

  return <C {...params} />;
};
