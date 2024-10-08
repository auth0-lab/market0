import { AI } from "@/app/actions";
import { ChatProvider } from "@/components/chat/context";
import { Header } from "@/components/chat/header";
import { ShareConversation } from "@/components/chat/share";
import { UnauthorizedError } from "@/components/fga/unauthorized";
import { getHistoryFromStore } from "@/llm/actions/history";
import { getUser, withFGA } from "@/sdk/fga";
import { withCheckPermission } from "@/sdk/fga/next/with-check-permission";

type RootChatParams = Readonly<{
  children: React.ReactNode;
  params: {
    id: string;
  };
}>;

async function RootLayout({ children, params }: RootChatParams) {
  const conversation = await getHistoryFromStore(params.id);
  const { messages, ownerID } = conversation;
  const user = await getUser();

  return (
    <ChatProvider chatId={params.id}>
      <Header>
        <ShareConversation user={user} />
      </Header>

      <AI initialAIState={messages} conversationID={params.id}>
        {children}
      </AI>
    </ChatProvider>
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
