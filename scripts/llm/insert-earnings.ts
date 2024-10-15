import dotenv from "dotenv";
import type { Document } from "@langchain/core/documents";
import stocks from "@/lib/market/stocks.json";

dotenv.config({ path: ".env.local" });

import { getDocumentsVectorStore } from "../../lib/documents";
import { documents } from "../../lib/db";
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
  quarter,
  previousReports,
  situation
}: { summary: string, name: string, symbol: string, quarter: string, previousReports: string[], situation: string }) => {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    temperature: 0.2,
    system: `
      You represent the board of directors of a fictitious company called ${name} with ticker ${symbol}.

      The company summary is: ${summary}.

      You are writing the earning report - SEC filling for the ${quarter}.

      The overall situation is ${situation}.

      ${previousReports.length > 0 ?
        'The previous earnings reports were:' : ''}

      ${previousReports.join('\n')}
    `,
    prompt: `Generate the earnings report for quarter ${quarter} for ${name}.`,
  });
  return text;
}

async function main() {
  const vectorStore = await getDocumentsVectorStore();

  // Delete all earnings documents for a fresh start
  await documents.removeAll('earning');

  const docs = [];

  const last4Quarters = [
    '4th Quarter 2023',
    '1st Quarter 2024',
    '2nd Quarter 2024',
    '3rd Quarter 2024',
  ];

  for (const stock of stocks) {
    const { symbol } = stock;
    const previousReports: string[] = [];
    for (const quarter of last4Quarters) {
      const earningReport = await generateEarningsReport({
        ...stock,
        name: stock.longname,
        summary: stock.long_business_summary,
        quarter,
        previousReports
      });

      previousReports.push(earningReport);

      const document: Document = {
        metadata: {
          id: generateId(),
          title: `${quarter} earnings report for ${symbol}`,
          symbol: symbol,
          type: 'earning',
        },
        pageContent: earningReport,
      };

      docs.push(document);
    }
  }

  await vectorStore.addDocuments(docs);
  process.exit(0);
}

main().catch((err) => {
  console.error("Found error inserting Documents on Vector Store");
  console.error(err);
});
