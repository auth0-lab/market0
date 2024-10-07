import { AI } from "@/app/actions";
import { UnauthorizedError } from "@/components/fga/unauthorized";
import { getHistory } from "@/llm/actions/history";
import { getUser, withFGA } from "@/sdk/fga";
import { withCheckPermission } from "@/sdk/fga/next/with-check-permission";
import { UserProvider } from "@auth0/nextjs-auth0/client";

type RootChatParams = Readonly<{
  children: React.ReactNode;
  params: {
    id: string;
  };
}>;

async function RootLayout({ children, params }: RootChatParams) {
  const messages = await getHistory(params.id);
  return (
    <AI initialAIState={messages} conversationID={params.id}>
      <UserProvider>{children}</UserProvider>
    </AI>
  );
}

export default withCheckPermission(
  {
    checker: async ({ params }: RootChatParams) => {
      const user = await getUser();

      const checkers = [
        // owner check
        withFGA({
          object: `chat:${params.id}`,
          relation: "can_view",
        }),

        // read-only check
        withFGA({
          user: user.email ? `user:${user.email}` : undefined,
          object: `chat:${params.id}`,
          relation: "can_view",
        }),
      ];

      const checks = await Promise.all(checkers);

      // if any of the checks pass, allow access
      return checks.some((allowed) => allowed);
    },
    onUnauthorized: () => (
      <UnauthorizedError>The conversation does not exist or you are not authorized to access it.</UnauthorizedError>
    ),
  },
  RootLayout
);
