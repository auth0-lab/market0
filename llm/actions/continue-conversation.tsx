"use server";

import { generateId } from "ai";
import { getMutableAIState, streamUI } from "ai/rsc";

import Loader from "@/components/loader";
import { userUsage } from "@/lib/db";
import { composeTools } from "@/llm/ai-helpers";
import * as serialization from "@/llm/components/serialization";
import { getSystemPrompt } from "@/llm/system-prompt";
import getDocs from "@/llm/tools/get-docs";
import getEvents from "@/llm/tools/get-events";
import listStocks from "@/llm/tools/list-stocks";
import showCurrentPositions from "@/llm/tools/show-current-positions";
import showStockPrice from "@/llm/tools/show-stock-price";
import showStockPurchaseUI from "@/llm/tools/show-stock-purchase-ui";
import { ClientMessage, ServerMessage } from "@/llm/types";
import { getUser } from "@/sdk/fga";
import { openai } from "@ai-sdk/openai";

import { FormattedText } from "../components/FormattedText";
import addConditionalPurchase from "../tools/add-conditional-purchase";
import addReminder from "../tools/add-reminder";

export async function continueConversation(
  input: string
): Promise<ClientMessage> {
  "use server";
  const user = await getUser();
  const history = getMutableAIState();

  if (!(await userUsage.hasAvailableTokens(user.sub, user.email))) {
    return {
      id: generateId(),
      role: "assistant",
      display: "You have reached the token limit for this conversation. Please try again later.",
    };
  }

  history.update((messages: ServerMessage[]) => [
    ...messages,
    { role: "user", content: input },
  ]);

  const promptMessages = history.get();

  const result = await streamUI({
    model: openai("gpt-4o"),
    temperature: 0,
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
      addReminder,
      addConditionalPurchase,
      showStockPrice,
      showCurrentPositions,
      showStockPurchaseUI,
      listStocks,
      getEvents,
      getDocs
    ),
    initial: <Loader />,
    // TODO: implement a max token limit
    onFinish: async ({ usage }) => {
      const { promptTokens, completionTokens, totalTokens } = usage;
      const stats = await userUsage.track(user.sub, totalTokens);
      console.log(`User ${user.email} used ${totalTokens} tokens in this conversation. Last hour: ${stats.lastHour}, last day: ${stats.lastDay}.`);
    },
  });

  return {
    id: generateId(),
    role: "assistant",
    display: result.value,
  };
}
