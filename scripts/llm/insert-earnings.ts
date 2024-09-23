import dotenv from "dotenv";
import type { Document } from "@langchain/core/documents";
import stocks from "../../lib/market/stocks.json";

dotenv.config({ path: ".env.local" });

import { getDocumentsVectorStore } from "../../lib/documents";
import { deleteDocuments } from "../../lib/db";
import { generateId, generateText } from "ai";
import { openai } from "@ai-sdk/openai";

/**
 * The purpose of this file is to generate earnings reports for the last 4
 * quarters for each stock in the stocks.json file.
 *
 * We use the OpenAI API to generate the earnings reports.
 */

const generateEarningsReport = async ({
  symbol,
  name,
  summary,
  quarter
}: { summary: string, name: string, symbol: string, quarter: string }) => {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    temperature: 1,
    system: `
      You are the board of directors of a fictitious company called ${name} with ticker ${symbol}.
      The company summary is: ${summary}.
      You can write a report on the company's financial performance for the ${quarter} quarter.
    `,
    prompt: `Generate the earnings report for quarter ${quarter} for ${name}.`,
  });
  return text;
}

async function main() {
  const vectorStore = await getDocumentsVectorStore();

  // Delete all earnings documents for a fresh start
  await deleteDocuments('earning');

  const documents = [];
  const last4Quarters = ['1st Quarter 2025', '4th Quarter 2024', '3rd Quarter 2024', '2nd Quarter 2024'];

  for (const stock of stocks) {
    const { symbol } = stock;
    for (const quarter of last4Quarters) {
      const earningReport = await generateEarningsReport({
        ...stock,
        name: stock.longname,
        summary: stock.long_business_summary,
        quarter
      });
      console.log(earningReport);
      const document: Document = {
        metadata: {
          id: generateId(),
          title: `${quarter} earnings report for ${symbol}`,
          symbol: symbol,
          link: `https://example.com/earnings/${symbol}?quarter=${quarter}`,
          type: 'earning',
        },
        pageContent: earningReport,
      };
      documents.push(document);
    }
  }

  await vectorStore.addDocuments(documents);
  process.exit(0);
}

main().catch((err) => {
  console.error("Found error inserting Documents on Vector Store");
  console.error(err);
});
