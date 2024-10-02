import { ReactNode } from "react";
import { z, ZodTypeAny } from "zod";

// Copied from vercel/ai because these types are not exported
type Streamable$1 = ReactNode | Promise<ReactNode>;
export type Renderer$1<T extends Array<any>> = (...args: T) => Streamable$1 | Generator<Streamable$1, Streamable$1, void> | AsyncGenerator<Streamable$1, Streamable$1, void>;
export type RenderTool<T extends ZodTypeAny> = {
  description?: string;
  parameters: T,
  generate?: Renderer$1<[
    z.infer<T>,
    {
      toolName: string;
      toolCallId: string;
    }
  ]>;
};

/**
 *
 * Defines a tool with a name and a set of parameters
 *
 * @param name - The name of the tool
 * @param params - The parameters of the tool
 * @returns
 */
export const defineTool = <TName extends string, T extends z.ZodTypeAny>(
  name: TName,
  params: RenderTool<T> | (() => RenderTool<T> | Promise<RenderTool<T>>)
): { [K in TName]: () => Promise<RenderTool<T>> } => {
  let tool: () => Promise<RenderTool<T>>;
  if (typeof params === "function") {
    tool = () => Promise.resolve(params());
  } else {
    tool = () => Promise.resolve(params);
  }
  return { [name]: tool } as { [K in TName]: () => Promise<RenderTool<T>> };
};

// Helper types for the composeTools function
type Unpromisify<T> = T extends Promise<infer U> ? U : T;
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type ExtractReturnTypes<T extends any[]> = {
  [K in keyof T]: T[K] extends { [P in keyof T[K]]: () => infer R } ? { [P in keyof T[K]]: Unpromisify<R> } : never
};
type MergeReturnTypes<T extends any[]> = UnionToIntersection<ExtractReturnTypes<T>[number]>;

/**
 *
 * Helper function to combine tools into a tool object.
 *
 * @param tools - The tools to combine
 * @returns The combined tools
 */
export async function composeTools<
  TOOLS extends { [name: string]: z.ZodTypeAny } = {},
  TOOL_GENERATORS extends { [K in keyof TOOLS]: () => Promise<RenderTool<TOOLS[K]>> }[] = []
>(...toolGenerators: TOOL_GENERATORS): Promise<MergeReturnTypes<TOOL_GENERATORS>> {
  return Promise.all(
    toolGenerators.map(async generator => {
      const tools = await Promise.all(
        Object.entries(generator)
          .map(async ([toolName, toolGenerator]) => {
            const tool = await toolGenerator();
            return { [toolName]: tool } as { [K in keyof TOOLS]: RenderTool<TOOLS[K]> };
          })
      );
      return Object.assign({}, ...tools);
    })
  ).then((resolvedTools) => {
    return Object.assign({}, ...resolvedTools) as MergeReturnTypes<TOOL_GENERATORS>;
  });
}
