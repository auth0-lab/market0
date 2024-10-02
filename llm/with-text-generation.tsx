import { CoreMessage, generateText, streamText } from "ai";
import { getMutableAIState } from "ai/rsc";
import { ReactNode } from "react";

import { Renderer$1 } from "./ai-helpers";
import { aiParams } from "./ai-params";
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
  const { textStream, text } = await streamText({
    ...aiParams,
    ...params,
    messages: [
      {
        role: "system",
        content: await getSystemPrompt()
      },
      ...currentMessages,
      ...toolMessages,
    ],
    onFinish: async ({ text }) => {
      state.done((messages: CoreMessage[]) => [
        ...messages,
        ...toolMessages,
        {
          role: "assistant",
          content: text,
        }
      ]);
    }
  });

  return { textStream, text };
};

type SimpleRenderer<ToolParam> = Renderer$1<[
  ToolParam,
  {
    toolName: string;
    toolCallId: string;
  }
]>;
/**
 * Wraps the generate function of a tool to generate text messages.
 *
 * @param params - The parameters to pass to the text generation API.
 * @param fn - The function to wrap.
 * @returns - The wrapped function.
 */
export function withTextGeneration<ToolParam = any>(
  params: WithTextGenerationParams | SimpleRenderer<ToolParam>,
  fn?: SimpleRenderer<ToolParam>
) {
  const state = getMutableAIState();
  if (typeof params === 'function') {
    fn = params;
    params = {};
  }
  if (!fn) {
    throw new Error('fn is required');
  }
  return async function* (
    toolParam: ToolParam,
    { toolName, toolCallId } : {toolName: string; toolCallId: string}
  ): AsyncGenerator<ReactNode, ReactNode, unknown> {

    let itr: IteratorResult<ReactNode, ReactNode>;
    const it = fn(toolParam, { toolName, toolCallId });
    let toolReturn: any;

    if (
      it && typeof it === 'object' &&
      (Symbol.iterator in it || Symbol.asyncIterator in it)
    ) {
      // @ts-ignore
      while (!(itr = await it.next()).done) {
          yield itr.value;
      }
      toolReturn = itr.value;
    } else{
      toolReturn = await it;
    }

    if (toolReturn !== undefined) {
      const { text, textStream } = await buildMessage(
        params,
        { toolName, toolCallId, toolArgs: toolParam },
        toolReturn,
        state
      );

      let currentText = '';
      for await (const textPart of textStream) {
        currentText += textPart;
        yield currentText;
      }

      return text;
    }

    return;
  };
}
