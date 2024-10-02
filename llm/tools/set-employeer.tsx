import { z } from "zod";

import Loader from "@/components/loader";
import { defineTool } from "@/llm/ai-helpers";
import { fgaClient, getUser } from "@/sdk/fga";

import { withTextGeneration } from "../with-text-generation";

export default defineTool("set_employeer", async () => {
  return {
    description: `Allows the user to set or unset its current employeer.
    Use this tool when the user purposedly set or casually mention its current employeer.
    `,
    parameters: z.object({
      employeer: z
        .string()
        .describe("The ticker of the company the user is currently working for"),
      status: z
        .boolean()
        .describe("Whether the user is currently working for the company"),
    }),
    generate: withTextGeneration({}, async function* ({ employeer, status }: { employeer: string; status: boolean }) {
      yield <Loader />;

      const user = await getUser();

      try {
        await fgaClient.write(
          {
            [ status ? 'writes' : 'deletes']: [
              {
                user: `user:${user.sub}`,
                relation: "employee",
                object: "company:atko",
              },
            ],
          }
        );
      } catch(err: any) {
        // it might fail because the tuple does not exist
        // or already exist. we don't care about that.
        console.warn(err?.message);
      }

      return `Noted that you are ${status ? 'now' : 'no longer'} working for ${employeer}.`;
    }),
  };
});
