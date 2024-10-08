import { z } from "zod";

import { getPositions } from "@/lib/db";
import { defineTool } from "@/llm/ai-helpers";
import { Positions } from "@/llm/components/positions";
import * as serialization from "@/llm/components/serialization";
import { getHistory } from "@/llm/utils";
import { getUser } from "@/sdk/fga";

export default defineTool("show_current_positions", () => {
  const history = getHistory();
  return {
    description:
      "Show the current stock positions the user has. Use this tool when the user request to see their current stock positions or holdings.",
    parameters: z.object({}),
    generate: async function* () {
      const user = await getUser();
      const positions = await getPositions(user.sub);

      history.update({
        role: "assistant",
        content: `[Current User Positions ${JSON.stringify(positions)}]`,
        componentName: serialization.names.get(Positions)!,
        params: { positions },
      });

      return <Positions positions={positions} />;
    },
  };
});
