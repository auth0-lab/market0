import { generateText } from "ai";
import toPlainObject from "lodash.toplainobject";
import { z } from "zod";

import { userUsage } from "@/lib/db";
import { checkEnrollment } from "@/llm/actions/forecast-enrollment";
import { getSymbolRetriever } from "@/llm/actions/langchain-helpers";
import { defineTool } from "@/llm/ai-helpers";
import { Documents } from "@/llm/components/documents";
import * as serialization from "@/llm/components/serialization";
import { getHistory } from "@/llm/utils";
import { getUser } from "@/sdk/fga";
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
      originalMessage: z.string()
        .describe('The original and complete message the user send.')
    }),
    generate: async function* ({ symbol, earnings, forecasts, originalMessage }) {
      const canEnroll = forecasts && !(await checkEnrollment({ symbol }));

      const retriever = await getSymbolRetriever(symbol);
      const messageToRetrieve = `${buildRequiredInfoText({ earnings, forecasts })} for ${symbol}`;
      const documents = await retriever.invoke(
        messageToRetrieve
      );

      const { text, usage } = await generateText({
        model: openai("gpt-4o"),
        temperature: 1,
        system: `
          You are a financial analyst. You are analyzing the earnings data and forecasts for ${symbol}.
          Be succint, no more than 500 words.
          ${canEnroll ? 'The user requested forecast but is not currently enrolled to received forecast data. Do not generate any forecast.' : ''}
          ${forecasts && !earnings ? 'Be very concise about earnings and focus only on forecast. Be explicit about your sentiment Bullish / Bearish.' : ''}
          ${documents.length > 0 ? "Here are the documents you have:" : "Inform the user there is no related information."}
          ${documents
            .map(
              (document) =>
                `\nTitle: ${document.metadata.title}\nContent: ${document.pageContent}\n\n`
            )
            .join("")}
          `,
        prompt: originalMessage,
      });

      // TODO can we track this globally?
      const user = await getUser();
      await userUsage.track(user.sub, usage.totalTokens);

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
