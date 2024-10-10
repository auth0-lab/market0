"use server";

import { generateId } from "ai";
import { getMutableAIState, streamUI } from "ai/rsc";

import Loader from "@/components/loader";
import { userUsage } from "@/lib/db";
import { composeTools } from "@/llm/ai-helpers";
import * as serialization from "@/llm/components/serialization";
import { getSystemPrompt } from "@/llm/system-prompt";
import checkSubscription from "@/llm/tools/newsletter/check-subscription";
import setSubscription from "@/llm/tools/newsletter/set-subscription";
import setEmployeer from "@/llm/tools/profile/set-employeer";
import setProfileAttributes from "@/llm/tools/profile/set-profile-attributes";
import getEvents from "@/llm/tools/schedule/get-events";
import addConditionalPurchase from "@/llm/tools/trading/add-conditional-purchase";
import getForecasts from "@/llm/tools/trading/get-forecasts";
import listStocks from "@/llm/tools/trading/list-stocks";
import showCurrentPositions from "@/llm/tools/trading/show-current-positions";
import showStockPrice from "@/llm/tools/trading/show-stock-price";
import showStockPurchaseUI from "@/llm/tools/trading/show-stock-purchase-ui";
import { ClientMessage, ServerMessage } from "@/llm/types";
import { getUser } from "@/sdk/fga";

import { aiParams } from "../ai-params";
import { FormattedText } from "../components/FormattedText";

type ContinueConversationParams = {
  /**
   * The message to continue the conversation with.
   */
  message: string;

  /**
   * whether to hide this message in the ui.
   */
  hidden: boolean;
};

export async function continueConversation(
  input: string | ContinueConversationParams
): Promise<ClientMessage> {
  "use server";
  const user = await getUser();
  const history = getMutableAIState();

  let hidden = false;
  if (typeof input === 'object') {
    hidden = input.hidden;
    input = input.message;
  }

  if (!(await userUsage.hasAvailableTokens(user.sub, user.email))) {
    return {
      id: generateId(),
      role: "assistant",
      display: "You have reached the token limit for this conversation. Please try again later.",
    };
  }

  history.update((messages: ServerMessage[]) => [
    ...messages,
    { role: "user", content: input, hidden },
  ]);

  const promptMessages = history.get();

  const result = await streamUI({
    ...aiParams,
    system: await getSystemPrompt(),
    messages: promptMessages,
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          {
            role: "assistant",
            content,
            componentName: serialization.names.get(FormattedText),
            params: { content },
          },
        ]);
      }

      return <FormattedText content={content} />;
    },
    tools: await composeTools(
      showStockPurchaseUI,
      addConditionalPurchase,
      showStockPrice,
      showCurrentPositions,
      listStocks,
      getEvents,
      getForecasts,
      setEmployeer,
      checkSubscription,
      setSubscription,
      setProfileAttributes
    ),
    initial: <Loader />,
    // TODO: implement a max token limit
    onFinish: async ({ usage }) => {
      const stats = await userUsage.track(user.sub, usage);
      console.log(`User ${user.email} used ${usage.totalTokens} tokens in this conversation. Last hour: ${stats.lastHour}, last day: ${stats.lastDay}.`);
    },
  });

  return {
    id: generateId(),
    role: "assistant",
    display: result.value,
  };
}
