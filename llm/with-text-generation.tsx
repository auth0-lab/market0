import { CoreMessage, generateText, LanguageModelV1 } from "ai";
import { getMutableAIState } from "ai/rsc";
import { ReactNode } from "react";

import { openai } from "@ai-sdk/openai";

import { getSystemPrompt } from "./system-prompt";

type WithTextGenerationParams = Partial<Omit<Parameters<typeof generateText>[0], 'messages'>>;

const buildMessage = async (
  params: WithTextGenerationParams,
  { toolName, toolCallId, toolArgs } : {toolName: string; toolCallId: string, toolArgs: any },
  toolResponse: any,
  state: ReturnType<typeof getMutableAIState>
) => {
  const toolMessages: CoreMessage[] = [
    {
      role: "assistant",
      content: [
        {
          type: "tool-call",
          toolName,
          toolCallId,
          args: toolArgs,
        },
      ],
    },
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolName,
          toolCallId,
          result: toolResponse,
        },
      ],
    },
  ];

  const currentMessages = state.get() as CoreMessage[];
  const { text: assistantResponse } = await generateText({
    model: openai("gpt-3.5-turbo"),
    temperature: 0.3,
    ...params,
    messages: [
      {
        role: "system",
        content: await getSystemPrompt()
      },
      ...currentMessages,
      ...toolMessages,
    ],
  });

  state.done((messages: CoreMessage[]) => [
    ...messages,
    ...toolMessages,
    {
      role: "assistant",
      content: assistantResponse,
    }
  ]);

  return assistantResponse;
};

/**
 * Wraps the generate function of a tool to generate text messages.
 *
 * @param params - The parameters to pass to the text generation API.
 * @param fn - The function to wrap.
 * @returns - The wrapped function.
 */
export function withTextGeneration<ToolParam = any>(
  params: WithTextGenerationParams,
  fn: (toolParam: ToolParam) => AsyncGenerator<ReactNode, ReactNode, unknown>
) {
  const state = getMutableAIState();

  return async function* (
    toolParam: ToolParam,
    { toolName, toolCallId } : {toolName: string; toolCallId: string}
  ): AsyncGenerator<ReactNode, ReactNode, unknown> {

    let itr: IteratorResult<ReactNode, ReactNode>;
    const it = fn(toolParam);
    while (!(itr = await it.next()).done) {
        yield itr.value;
    }
    const toolReturn = itr.value;

    if (toolReturn !== undefined) {
      const message = await buildMessage(
        params,
        { toolName, toolCallId, toolArgs: toolParam },
        toolReturn,
        state
      );
      return message;
    }

    return;
  };
}
