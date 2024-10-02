import { streamText } from "ai";
import toPlainObject from "lodash.toplainobject";
import { z } from "zod";

import { userUsage } from "@/lib/db";
import { getSymbolRetriever } from "@/llm/actions/langchain-helpers";
import { checkEnrollment } from "@/llm/actions/newsletter";
import { defineTool } from "@/llm/ai-helpers";
import { Documents } from "@/llm/components/documents";
import * as serialization from "@/llm/components/serialization";
import { getHistory } from "@/llm/utils";
import { getUser } from "@/sdk/fga";

import { aiParams } from "../ai-params";

const buildRequiredInfoText = ({ earnings, forecasts}: { earnings: boolean, forecasts: boolean }) => {
  const requiredInfo = [];
  if (earnings) {
    requiredInfo.push('earnings');
  }
  if (forecasts) {
    requiredInfo.push('forecasts');
  }
  return requiredInfo.join(' and ');
}

export default defineTool("get_docs", () => {
  const history = getHistory();

  return {
    description: `Summarize earnings data and forecasts for a given stock.`,
    parameters: z.object({
      symbol: z
        .string()
        .describe(
          "The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD."
        ),
      originalMessage: z.string()
        .describe('The original and complete message the user send.')
    }),
    generate: async function* ({ symbol, originalMessage }) {
      const retriever = await getSymbolRetriever(symbol);
      const documents = await retriever.invoke(
        originalMessage
      );
      const { textStream, text: fullText, usage } = await streamText({
        ...aiParams,
        temperature: 0.1,
        system: `
          You are a financial analyst. You are analyzing the earnings data and forecasts for ${symbol}.
          Summarize the response in no more than 200 words, focusing on key points.
          If the provided documents contain forecasts, make sure to include them in the response, otherwise focus on the earnings data.
          ${documents.length > 0 ? "Here are the documents you have:" : "Inform the user there is no related information."}
          ${documents
            .map(
              (document) =>
                `\nTitle: ${document.metadata.title}\nContent: ${document.pageContent}\n\n`
            )
            .join("")}
          `,
        prompt: originalMessage,
        onFinish: async ({usage}) => {
          const user = await getUser();
          await userUsage.track(user.sub, usage);
        }
      });

      const baseParams = {
        symbol,
        documents: documents.map(toPlainObject),
      };

      let currentText = '';
      for await (const textPart of textStream) {
        currentText += textPart;
        yield <Documents {...baseParams} text={currentText} documents={[]} />
      }

      //once finished:
      const text = await fullText;
      const params = {
        ...baseParams,
        text,
      };

       history.update({
        role: "assistant",
        content: text,
        componentName: serialization.names.get(Documents)!,
        params: params,
      });

      return <Documents {...params} />;
    },
  };
});
