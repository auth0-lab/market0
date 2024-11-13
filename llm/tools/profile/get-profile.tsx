import { z } from "zod";

import Loader from "@/components/loader";
import { checkEnrollment } from "@/llm/actions/newsletter";
import { defineTool } from "@/llm/ai-helpers";
import { ProfileCard } from "@/llm/components/profile";
import * as serialization from "@/llm/components/serialization";
import { getHistory } from "@/llm/utils";
import { withTextGeneration } from "@/llm/with-text-generation";
import { isGuardianEnrolled } from "@/sdk/auth0/mgmt";
import { fgaClient, getUser } from "@/sdk/fga";

import stocks from "../../../lib/market/stocks.json";

/**
 * This tool allows the user to set their first name and/or last name.
 * The changes are propagated to the Auth0's user profile.
 */
export default defineTool("show_me_what_you_know_about_me", async () => {
  const history = getHistory();

  return {
    description: `Use this tool to show the user information that the system knows about them.`,
    parameters: z.object({}),
    generate: async function* ({}) {
      yield <Loader />;

      const user = await getUser();

      const { allowed: userWorkForATKO } = await fgaClient.check({
        user: `user:${user.sub}`,
        relation: "employee",
        object: "company:atko",
      });

      const subscribedToNewsletter = await checkEnrollment({
        symbol: stocks[0].symbol,
      });

      const isEnrolled = await isGuardianEnrolled();

      const params = {
        profile: {
          fullName: user.name,
          email: user.email,
          imageUrl: user.picture,
          username: user.nickname,
          employment: userWorkForATKO ? stocks[0].longname : "",
          subscribedToNewsletter: subscribedToNewsletter ?? false,
          enrolledForAsyncAuth: isEnrolled,
        },
        readOnly: false,
      };

      history.update({
        role: "assistant",
        content: JSON.stringify(params),
        componentName: serialization.names.get(ProfileCard)!,
        params,
      });

      return <ProfileCard {...params} />;
    },
  };
});
