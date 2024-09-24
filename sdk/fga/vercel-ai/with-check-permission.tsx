import { getMutableAIState } from "ai/rsc";
import { ReactNode } from "react";

import { ServerMessage } from "@/llm/types";

import Loader from "../../components/loader";

type WithCheckPermissionParams<ToolParams> = {
  checker: (toolParams: ToolParams) => Promise<boolean>;
  onUnauthorized?: (
    toolParam: ToolParams
  ) => AsyncGenerator<ReactNode, ReactNode, unknown>;
};

const DEFAULT_UNAUTHORIZED_MESSAGE =
  "You are not authorized to perform this action.";

async function* defaultOnUnauthorized(): AsyncGenerator<
  ReactNode,
  ReactNode,
  unknown
> {
  return DEFAULT_UNAUTHORIZED_MESSAGE;
}

/**
 * Wrap the generate function of a vercel/ai tool with an FGA permission check.
 *
 * @param params
 * @param params.checker - A function that receives the same parameter
 *     than the generate func and checks
 *     if the user has permission to the tool.
 *     This can be `withFGA`.
 * @param params.onUnauthorized - A function that receives the same parameter
 *     than the generate func and returns a UI generator.
 *     This can be used to customize the unauthorized message.
 * @param fn - The generate func to wrap.
 * @returns A new generate func that checks permissions before executing the original function.
 */
export function withCheckPermission<ToolParam = any>(
  params: WithCheckPermissionParams<ToolParam>,
  fn: (toolParam: ToolParam) => AsyncGenerator<ReactNode, ReactNode, unknown>
) {
  const state = getMutableAIState();
  return async function* (
    toolParam: ToolParam
  ): AsyncGenerator<ReactNode, ReactNode, unknown> {
    yield <Loader />;

    let allowed = false;

    try {
      allowed = await params.checker(toolParam);
    } catch (e) {
      console.error(e);
    }

    if (allowed) {
      return yield* fn(toolParam);
    } else {
      if (params.onUnauthorized) {
        return yield* params.onUnauthorized(toolParam);
      }

      state.done((messages: ServerMessage[]) => [
        ...messages,
        {
          role: "system",
          content: `
          The user account calling this tool is not authorized at this time.
          This restriction applies only to the current user account and with the params '${JSON.stringify(
            params
          )}'.
          If the user insists on performing this action, please execute the tool again.
          `,
        },
        {
          role: "assistant",
          content: DEFAULT_UNAUTHORIZED_MESSAGE,
        },
      ]);

      return yield* defaultOnUnauthorized();
    }
  };
}