import dotenv from "dotenv";
import type { Document } from "@langchain/core/documents";

dotenv.config({ path: ".env.local" });

import { getDocumentsVectorStore } from "../../lib/documents";
import { deleteDocuments } from "../../lib/db";

const documents: Document[] = [
  {
    metadata: {
      id: "gFPKKADh5HEwckh3br36Sm",
      title: "1st Quarter 2025",
      symbol: "NVDA",
      link: "https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2025",
    },
    pageContent: `NVIDIA (NASDAQ: NVDA) today reported revenue for the first quarter ended April 28, 2024, of $26.0 billion, up 18% from the previous quarter and up 262% from a year ago.

For the quarter, GAAP earnings per diluted share was $5.98, up 21% from the previous quarter and up 629% from a year ago. Non-GAAP earnings per diluted share was $6.12, up 19% from the previous quarter and up 461% from a year ago.

“The next industrial revolution has begun — companies and countries are partnering with NVIDIA to shift the trillion-dollar traditional data centers to accelerated computing and build a new type of data center — AI factories — to produce a new commodity: artificial intelligence,” said Jensen Huang, founder and CEO of NVIDIA. “AI will bring significant productivity gains to nearly every industry and help companies be more cost- and energy-efficient, while expanding revenue opportunities.

“Our data center growth was fueled by strong and accelerating demand for generative AI training and inference on the Hopper platform. Beyond cloud service providers, generative AI has expanded to consumer internet companies, and enterprise, sovereign AI, automotive and healthcare customers, creating multiple multibillion-dollar vertical markets.

“We are poised for our next wave of growth. The Blackwell platform is in full production and forms the foundation for trillion-parameter-scale generative AI. Spectrum-X opens a brand-new market for us to bring large-scale AI to Ethernet-only data centers. And NVIDIA NIM is our new software offering that delivers enterprise-grade, optimized generative AI to run on CUDA everywhere — from the cloud to on-prem data centers and RTX AI PCs — through our expansive network of ecosystem partners.”

NVIDIA also announced a ten-for-one forward stock split of NVIDIA’s issued common stock to make stock ownership more accessible to employees and investors. The split will be effected through an amendment to NVIDIA’s Restated Certificate of Incorporation, which will result in a proportionate increase in the number of shares of authorized common stock. Each record holder of common stock as of the close of market on Thursday, June 6, 2024, will receive nine additional shares of common stock, to be distributed after the close of market on Friday, June 7, 2024. Trading is expected to commence on a split-adjusted basis at market open on Monday, June 10, 2024.

NVIDIA is increasing its quarterly cash dividend by 150% from $0.04 per share to $0.10 per share of common stock. The increased dividend is equivalent to $0.01 per share on a post-split basis and will be paid on Friday, June 28, 2024, to all shareholders of record on Tuesday, June 11, 2024.`,
  },
  {
    metadata: {
      id: "xih1ux26z9SicARvmcZJYj",
      title: "4th  Quarter 2024",
      symbol: "NVDA",
      link: "https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-fourth-quarter-and-fiscal-2024",
    },
    pageContent: `NVIDIA (NASDAQ: NVDA) today reported revenue for the fourth quarter ended January 28, 2024, of $22.1 billion, up 22% from the previous quarter and up 265% from a year ago.

For the quarter, GAAP earnings per diluted share was $4.93, up 33% from the previous quarter and up 765% from a year ago. Non-GAAP earnings per diluted share was $5.16, up 28% from the previous quarter and up 486% from a year ago.

For fiscal 2024, revenue was up 126% to $60.9 billion. GAAP earnings per diluted share was $11.93, up 586% from a year ago. Non-GAAP earnings per diluted share was $12.96, up 288% from a year ago.

“Accelerated computing and generative AI have hit the tipping point. Demand is surging worldwide across companies, industries and nations,” said Jensen Huang, founder and CEO of NVIDIA.

“Our Data Center platform is powered by increasingly diverse drivers — demand for data processing, training and inference from large cloud-service providers and GPU-specialized ones, as well as from enterprise software and consumer internet companies. Vertical industries — led by auto, financial services and healthcare — are now at a multibillion-dollar level.

“NVIDIA RTX, introduced less than six years ago, is now a massive PC platform for generative AI, enjoyed by 100 million gamers and creators. The year ahead will bring major new product cycles with exceptional innovations to help propel our industry forward. Come join us at next month’s GTC, where we and our rich ecosystem will reveal the exciting future ahead,” he said.

NVIDIA will pay its next quarterly cash dividend of $0.04 per share on March 27, 2024, to all shareholders of record on March 6, 2024.`,
  },
  {
    metadata: {
      id: "hH8b7sazwzgrkn7bUEeT5x",
      title: "3rd Quarter 2024",
      symbol: "NVDA",
      link: "https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-third-quarter-fiscal-2024",
    },
    pageContent: `NVIDIA (NASDAQ: NVDA) today reported revenue for the third quarter ended October 29, 2023, of $18.12 billion, up 206% from a year ago and up 34% from the previous quarter.

GAAP earnings per diluted share for the quarter were $3.71, up more than 12x from a year ago and up 50% from the previous quarter. Non-GAAP earnings per diluted share were $4.02, up nearly 6x from a year ago and up 49% from the previous quarter.

“Our strong growth reflects the broad industry platform transition from general-purpose to accelerated computing and generative AI,” said Jensen Huang, founder and CEO of NVIDIA.

“Large language model startups, consumer internet companies and global cloud service providers were the first movers, and the next waves are starting to build. Nations and regional CSPs are investing in AI clouds to serve local demand, enterprise software companies are adding AI copilots and assistants to their platforms, and enterprises are creating custom AI to automate the world’s largest industries.

“NVIDIA GPUs, CPUs, networking, AI foundry services and NVIDIA AI Enterprise software are all growth engines in full throttle. The era of generative AI is taking off,” he said.

NVIDIA will pay its next quarterly cash dividend of $0.04 per share on December 28, 2023, to all shareholders of record on December 6, 2023.`,
  },
  {
    metadata: {
      id: "aiDnCG1hybRzuo3YcKSMf4",
      title: "2nd Quarter 2024",
      symbol: "NVDA",
      link: "https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2024",
    },
    pageContent: `NVIDIA (NASDAQ: NVDA) today reported revenue for the second quarter ended July 30, 2023, of $13.51 billion, up 101% from a year ago and up 88% from the previous quarter.

GAAP earnings per diluted share for the quarter were $2.48, up 854% from a year ago and up 202% from the previous quarter. Non-GAAP earnings per diluted share were $2.70, up 429% from a year ago and up 148% from the previous quarter.

“A new computing era has begun. Companies worldwide are transitioning from general-purpose to accelerated computing and generative AI,” said Jensen Huang, founder and CEO of NVIDIA.

“NVIDIA GPUs connected by our Mellanox networking and switch technologies and running our CUDA AI software stack make up the computing infrastructure of generative AI.

“During the quarter, major cloud service providers announced massive NVIDIA H100 AI infrastructures. Leading enterprise IT system and software providers announced partnerships to bring NVIDIA AI to every industry. The race is on to adopt generative AI,” he said.

During the second quarter of fiscal 2024, NVIDIA returned $3.38 billion to shareholders in the form of 7.5 million shares repurchased for $3.28 billion, and cash dividends. As of the end of the second quarter, the company had $3.95 billion remaining under its share repurchase authorization. On August 21, 2023, the Board of Directors approved an additional $25.00 billion in share repurchases, without expiration. NVIDIA plans to continue share repurchases this fiscal year.

NVIDIA will pay its next quarterly cash dividend of $0.04 per share on September 28, 2023, to all shareholders of record on September 7, 2023.`,
  },
];

async function main() {
  const vectorStore = await getDocumentsVectorStore();

  // Delete all earnings documents for a fresh start
  await deleteDocuments('earning');

  // Insert docs 1 by 1
  for (const document of documents) {
    console.log("inserting document", document.metadata.id);
    await vectorStore.addDocuments([document]);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Found error inserting Documents on Vector Store");
  console.error(err);
});
