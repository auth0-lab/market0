import { redirect } from "next/navigation";

import { AI } from "@/app/actions";
import { ChatProvider } from "@/components/chat/context";
import { Header } from "@/components/chat/header";
import { ShareConversation } from "@/components/chat/share";
import { ChatUsersPermissionsList } from "@/components/chat/share/users-permissions-list";
import { UnauthorizedError } from "@/components/fga/unauthorized";
import { getHistoryFromStore } from "@/llm/actions/history";
import { getUser, withFGA } from "@/sdk/fga";
import { assignChatReader, isChatOwner, isChatUser } from "@/sdk/fga/chats";
import { withCheckPermission } from "@/sdk/fga/next/with-check-permission";

type RootChatParams = Readonly<{
  children: React.ReactNode;
  params: {
    id: string;
  };
}>;

async function RootLayout({ children, params }: RootChatParams) {
  const conversation = await getHistoryFromStore(params.id);
  const user = await getUser();
  const { messages, ownerID } = conversation;
  const isOwner = await isChatOwner(params.id);

  return (
    <ChatProvider chatId={params.id} readOnly={!isOwner} hasMessages={messages.length > 0}>
      <div className="flex flex-col h-full w-full">
        <Header>
          <ShareConversation>
            {/**
             * Because of a rendering bug with server components and client
             * components, we require passing the chatId at this instance
             * instead of using the chatId from the context.
             */}
            <ChatUsersPermissionsList chatId={params.id} />
          </ShareConversation>
        </Header>

        <AI initialAIState={messages} conversationID={params.id}>
          {children}
        </AI>
      </div>
    </ChatProvider>
  );
}

export default withCheckPermission(
  {
    checker: async ({ params }: RootChatParams) =>
      withFGA({
        object: `chat:${params.id}`,
        relation: "can_view",
      }),
    onUnauthorized: async ({ params }: RootChatParams) => {
      const chatId = params.id;

      if (await isChatUser(chatId)) {
        await assignChatReader(chatId);
        return redirect(`/chat/${chatId}`);
      }

      return (
        <ChatProvider chatId={chatId} readOnly={true}>
          <div className="flex flex-col h-full w-full">
            <Header />
            <UnauthorizedError>
              The conversation does not exist or you are not authorized to access it.
            </UnauthorizedError>
          </div>
        </ChatProvider>
      );
    },
  },
  RootLayout
);
