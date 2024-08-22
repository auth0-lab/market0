"use server";

import { generateId } from "ai";
import { getMutableAIState, streamUI } from "ai/rsc";
import Markdown from "react-markdown";

import Loader from "@/components/loader";
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
import { openai } from "@ai-sdk/openai";

import { FormattedText } from "../components/FormattedText";
import addReminder from "../tools/add-reminder";
import addConditionalPurchase from "../tools/add-conditional-purchase";

export async function continueConversation(
  input: string
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();

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
    onFinish: ({ usage }) => {
      const { promptTokens, completionTokens, totalTokens } = usage;
      // your own logic, e.g. for saving the chat history or recording usage
      console.log("Prompt tokens:", promptTokens);
      console.log("Completion tokens:", completionTokens);
      console.log("Total tokens:", totalTokens);
      console.log("Finished conversation", history.get());
    },
  });

  return {
    id: generateId(),
    role: "assistant",
    display: result.value,
  };
}
