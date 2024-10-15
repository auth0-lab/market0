import { streamText } from "ai";
import { toPlainObject } from "lodash-es";
import { z } from "zod";

import { userUsage } from "@/lib/db";
import stocks from "@/lib/market/stocks.json";
import { getSymbolRetriever } from "@/llm/actions/langchain-helpers";
import { defineTool } from "@/llm/ai-helpers";
import { aiParams } from "@/llm/ai-params";
import { Documents } from "@/llm/components/documents";
import * as serialization from "@/llm/components/serialization";
import { getHistory } from "@/llm/utils";
import { getUser } from "@/sdk/fga";

export default defineTool("get_forecasts", () => {
  const history = getHistory();

  return {
    description: `Summarize earnings data and forecasts for a given stock.
If the user request a forecast analysis always run this.
Do not use previously shared forecasts in the conversation.`,
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
      const stock = stocks.find((stock) => stock.symbol === symbol);
      if (!stock) {
        return `I'm sorry, I couldn't find any information for the stock ${symbol}.`;
      }

      const { textStream, text: fullText } = await streamText({
        ...aiParams,
        temperature: 0.2,
        system: `
You are a stock trading conversation bot.

You have access to financial reports and documents for the fictional company ${stock}, with the ticker symbol ${symbol}.

Company Summary: ${stock.long_business_summary}

Summarize your responses in no more than 200 words, focusing on key points.

${documents.length > 0 ? "The following documents are available to the user:" : "Inform the user that no relevant information is available."}

${documents
  .map(
    (document) =>
      `\nTitle: ${document.metadata.title}\nContent: ${document.pageContent}\n\n`
  )
  .join("")}

Refer to the documents as "the documents available to you."

Only mention the source of the information (i.e., the documents available to you) if it's strictly necessary for context; otherwise, omit it.

If the documents available to the user do not include analyst forecasts:
- Provide relevant information based on earnings reports.
- Suggest that the user subscribe to the Market0 newsletter to gain access to these reports in the database.
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
        yield <Documents finished={false} {...baseParams} text={currentText} />
      }

      //once finished:
      const text = await fullText;
      const params = {
        ...baseParams,
        finished: true,
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
