import { AI, fetchUserById } from "@/app/actions";
import { ChatProvider } from "@/components/chat/context";
import { Header } from "@/components/chat/header";
import { ShareConversation } from "@/components/chat/share";
import { ChatUsersPermissionsList } from "@/components/chat/share/users-permissions-list";
import { UnauthorizedError } from "@/components/fga/unauthorized";
import { getHistoryFromStore } from "@/llm/actions/history";
import { getUser, withFGA } from "@/sdk/fga";
import { assignChatReader, isChatOwner, isUserInvitedToChat } from "@/sdk/fga/chats";
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
  const isOwner = await isChatOwner(params.id);
  const user = await getUser();
  const chatOwnerID = ownerID ?? (isOwner ? user.sub : undefined);
  const ownerProfile = chatOwnerID ? await fetchUserById(chatOwnerID) : undefined;

  return (
    <ChatProvider chatId={params.id} readOnly={!isOwner} hasMessages={messages.length > 0} ownerProfile={ownerProfile}>
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

        <AI initialAIState={messages} conversationID={params.id} readOnly={!isOwner}>
          {children}
        </AI>
      </div>
    </ChatProvider>
  );
}

export default withCheckPermission(
  {
    checker: async ({ params }: RootChatParams) => {
      const chatId = params.id;
      const allowed = await withFGA({
        object: `chat:${chatId}`,
        relation: "can_view",
      });

      if (!allowed && (await isUserInvitedToChat(chatId))) {
        await assignChatReader(chatId);
        return true;
      }

      return allowed;
    },
    onUnauthorized: ({ params }: RootChatParams) => (
      <ChatProvider chatId={params.id} readOnly={true}>
        <div className="flex flex-col h-full w-full">
          <Header />
          <UnauthorizedError>The conversation does not exist or you are not authorized to access it.</UnauthorizedError>
        </div>
      </ChatProvider>
    ),
  },
  RootLayout
);
