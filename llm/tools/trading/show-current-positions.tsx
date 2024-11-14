import { z } from "zod";

import { transactions } from "@/lib/db";
import { defineTool } from "@/llm/ai-helpers";
import * as serialization from "@/llm/components/serialization";
import { Positions } from "@/llm/components/stocks";
import { getHistory } from "@/llm/utils";
import { withTextGeneration } from "@/llm/with-text-generation";
import { getUser } from "@/sdk/fga";

/**
 * This tool allow the user to check their current stock positions.
 */
export default defineTool("show_current_positions", () => {
  const history = getHistory();
  return {
    description:
      "Show the current stock positions the user has. Use this tool when the user request to see their current stock positions or holdings.",
    parameters: z.object({}),
    generate: withTextGeneration(async function* () {
      const user = await getUser();
      const positions = await transactions.getPositions(user.sub);

      if (positions.length === 0) {
        return "You do not have any stock positions yet.";
      }

      history.update({
        role: "assistant",
        content: `[Current User Positions ${JSON.stringify(positions)}]`,
        componentName: serialization.names.get(Positions)!,
        params: { positions },
      });

      return <Positions positions={positions} />;
    }),
  };
});
