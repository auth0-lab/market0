import { bedrock } from "@ai-sdk/amazon-bedrock";
import { mistral } from "@ai-sdk/mistral";
import { openai } from "@ai-sdk/openai";

const providers = {
  'openai': openai,
  'mistral': mistral,
  'bedrock': bedrock,
}
const provider: keyof typeof providers =
  process.env.LLM_PROVIDER as keyof typeof providers ??
  'openai';

if (!Object.keys(providers).includes(provider)) {
  throw new Error(`LLM_PROVIDER must be set to: ${Object.keys(providers).join(', ')}`);
}

const model = process.env.LLM_MODEL ?? 'gpt-4o-mini';

export const aiParams = {
  model: providers[provider](model),
  temperature: 0.2,
};
