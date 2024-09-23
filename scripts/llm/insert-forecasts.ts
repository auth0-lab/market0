import dotenv from "dotenv";
import type { Document } from "@langchain/core/documents";
import stocks from "../../lib/market/stocks.json";


dotenv.config({ path: ".env.local" });

import { getDocumentsVectorStore } from "../../lib/documents";
import { deleteDocuments, documents } from "../../lib/db";
import { openai } from "@ai-sdk/openai";
import { generateId, generateText } from "ai";

/**
 *  The purpose of this file is to generate forecast reports for the next quarter
 *  for each stock in the stocks.json file.
 *
 *  We use the OpenAI API to generate the forecast reports.
 */

const generateForecast = async ({
  symbol,
  summary,
  lastEarning
}: {
  symbol: string,
  summary: string,
  lastEarning: string
}) => {
  const sentiment: 'bullish' | 'bearish' = Math.random() > 0.5 ? 'bullish' : 'bearish';
  const marketTrend = sentiment === 'bullish' ? 'outperform' : 'underperform';
  const { text } = await generateText({
    model: openai("gpt-4o"),
    temperature: 1,
    system: `You are a ficticious financial analyst.
    You are writing a report on ${symbol} a ficticious company for the next quarter.
    The ficticious company summary is: ${summary}.
    The last earning report was ${lastEarning}.
    You are ${sentiment} on the stock and believe it will ${marketTrend} the market.
    You are writing a report on the company's financial performance and future prospects.`,
    prompt: `Generate a forecast for ${symbol} for the next quarter.`,
  });
  return text;
}

async function main() {
  const vectorStore = await getDocumentsVectorStore();

  // Delete all earnings documents for a fresh start
  await deleteDocuments('forecast');
  const docs = [];
  for (const stock of stocks) {
    const { symbol } = stock;
    const lastEarnings = await documents.getLatestEarningReport(symbol);
    const forecast = await generateForecast({
      symbol,
      summary: stock.long_business_summary,
      lastEarning: lastEarnings.content
    });
    console.log(forecast);
    const document: Document = {
      metadata: {
        id: generateId(),
        title: `Forecast for ${symbol}`,
        symbol,
        link: `https://example.com/forecast/${symbol}`,
        type: 'forecast',
      },
      pageContent: forecast,
    };
    docs.push(document);
  }

  await vectorStore.addDocuments(docs);

  process.exit(0);
}

main().catch((err) => {
  console.error("Found error inserting Documents on Vector Store");
  console.error(err);
});
