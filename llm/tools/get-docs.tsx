import { generateText } from "ai";
import toPlainObject from "lodash.toplainobject";
import { z } from "zod";

import { getSymbolRetriever } from "@/llm/actions/langchain-helpers";
import { defineTool } from "@/llm/ai-helpers";
import { Documents } from "@/llm/components/documents";
import * as serialization from "@/llm/components/serialization";
import { getHistory } from "@/llm/utils";
import { checkAuthorization, getUser } from "@/sdk/fga";
import { openai } from "@ai-sdk/openai";

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
      earnings: z
        .boolean()
        .describe('Whether to include earnings data in the summary.')
        .optional()
        .default(false),
      forecasts: z
        .boolean()
        .describe('Whether to include forecasts in the summary.')
        .optional()
        .default(false),
    }),
    generate: async function* ({ symbol, earnings, forecasts }) {
      const canEnroll = forecasts && !(await checkAuthorization({
        object: `doc:forecast-${symbol}`,
        relation: "can_view"
      }));

      const retriever = await getSymbolRetriever(symbol);
      const messageToRetrieve = `${buildRequiredInfoText({ earnings, forecasts })} for ${symbol}`;
      const documents = await retriever.invoke(
        messageToRetrieve
      );

      const { text } = await generateText({
        model: openai("gpt-4o"),
        temperature: 1,
        system: `
          You are a financial analyst. You are analyzing the earnings data and forecasts for ${symbol}.
          ${canEnroll ? 'The user requested forecast but is not currently enrolled to received forecast data.' : ''}
          ${documents.length > 0 ? "Here are the documents you have:" : "Inform the user there is no related information."}
          ${documents
            .map(
              (document) =>
                `\nTitle: ${document.metadata.title}\nContent: ${document.pageContent}\n\n`
            )
            .join("")}
          `,
        prompt: `Summarize ${buildRequiredInfoText({earnings, forecasts})} for ${symbol}.`,
      });

      const params = {
        symbol,
        text,
        documents: documents.map(toPlainObject),
        requestedForecasts: forecasts
      };

       history.update({
        role: "assistant",
        content: `${text}
  [Documents: ${documents.length > 0 ? JSON.stringify({ documents }) : 0}]
  ${canEnroll ? 'User requested forecast but was not enrolled at the moment of this message.' : ''}
`,
        componentName: serialization.names.get(Documents)!,
        params: params,
      });

      return <Documents {...params} />;
    },
  };
});