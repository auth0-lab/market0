import dotenv from "dotenv";
import type { Document } from "@langchain/core/documents";

dotenv.config({ path: ".env.local" });

import { getDocumentsVectorStore } from "../../lib/documents";
import { deleteDocuments } from "../../lib/db";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const generateForecast = async ({ symbol }: { symbol: string }) => {
  const sentiment: 'bullish' | 'bearish' = Math.random() > 0.5 ? 'bullish' : 'bearish';
  const marketTrend = sentiment === 'bullish' ? 'outperform' : 'underperform';
  const { text } = await generateText({
    model: openai("gpt-4o"),
    temperature: 1,
    system: `You are a ficticious financial analyst. You are writing a report on ${symbol} for the next quarter. You are ${sentiment} on the stock and believe it will ${marketTrend} the market. You are writing a report on the company's financial performance and future prospects.`,
    prompt: `Generate a forecast for ${symbol} for the next quarter.`,
  });
  return text;
}

async function main() {
  const symbols = ['AAPL', 'GOOGL', 'TSLA', 'AMZN', 'MSFT', 'NVDA', 'INTC', 'AMD'];
  const vectorStore = await getDocumentsVectorStore();

  // Delete all earnings documents for a fresh start
  await deleteDocuments('forecast');
  const documents = [];
  for (const symbol of symbols) {
    const forecast = await generateForecast({ symbol });
    const document: Document = {
      metadata: {
        id: `forecast-${symbol}`,
        title: `Forecast for ${symbol}`,
        symbol,
        link: `https://example.com/forecast/${symbol}`,
        type: 'forecast',
      },
      pageContent: forecast,
    };
    documents.push(document);
  }

  await vectorStore.addDocuments(documents);

  process.exit(0);
}

main().catch((err) => {
  console.error("Found error inserting Documents on Vector Store");
  console.error(err);
});
