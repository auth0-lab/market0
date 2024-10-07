"use server";

import { generateId } from "ai";
import { createAI, getAIState } from "ai/rsc";

import { saveAIState } from "@/lib/db";
import { confirmPurchase } from "@/llm/actions/confirm-purchase";
import { continueConversation } from "@/llm/actions/continue-conversation";
import { checkEnrollment, enrollToNewsletter } from "@/llm/actions/newsletter";
import { createGoogleTask } from "@/llm/actions/reminders";
import * as serialization from "@/llm/components/serialization";
import { ClientMessage, ServerMessage } from "@/llm/types";
import { getUser } from "@/sdk/fga";

type Props = Parameters<
  ReturnType<typeof createAI<ServerMessage[], ClientMessage[]>>
>[0] & {
  conversationID: string;
};
const HIDDEN_ROLES = ["system", "tool"];
export const AI = (p: Props) => {
  const { conversationID, ...params } = p;

  const C = createAI<ServerMessage[], ClientMessage[]>({
    actions: {
      continueConversation,
      confirmPurchase,
      createGoogleTask,
      checkEnrollment,
      enrollToNewsletter,
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
      }
    },
    // @ts-ignore
    onGetUIState: async () => {
      "use server";

      const history: readonly ServerMessage[] =
        getAIState() as readonly ServerMessage[];

      return history
        .filter((c) => {
          const isHidden = c.hidden;
          const isToolCall =
            c.role === "assistant" &&
            Array.isArray(c.content) &&
            c.content.some((c) => c.type === "tool-call");
          return !isHidden && !isToolCall && !HIDDEN_ROLES.includes(c.role);
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
