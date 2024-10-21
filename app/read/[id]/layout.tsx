import { notFound, redirect } from "next/navigation";

import { AI, fetchUserById } from "@/app/actions";
import { isChatOwner, isCurrentUserInvitedToChat, setCurrentUserAsReader } from "@/app/chat/[id]/actions";
import { ChatProvider } from "@/components/chat/context";
import ConversationPicker from "@/components/chat/conversation-picker";
import { Header } from "@/components/chat/header";
import { ErrorContainer } from "@/components/fga/error";
import { conversations } from "@/lib/db";
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
  const [conversation, isOwner, user] = await Promise.all([
    conversations.get(params.id),
    isChatOwner(params.id),
    getUser(),
  ]);

  if (!conversation) {
    return notFound();
  }

  const { messages, ownerID } = conversation;
  const chatOwnerID = ownerID || (isOwner ? user?.sub : undefined);
  const ownerProfile = chatOwnerID ? await fetchUserById(chatOwnerID) : undefined;

  return (
    <UserProvider>
      <ChatProvider chatId={params.id} readOnly={true} hasMessages={messages.length > 0} ownerProfile={ownerProfile}>
        <AI initialAIState={messages} conversationID={params.id} readOnly={true}>
          <div className="flex flex-col h-full w-full">
            <Header outerElements={<ConversationPicker selectedConversation={conversation} />}></Header>
            {children}
          </div>
        </AI>
      </ChatProvider>
    </UserProvider>
  );
}

export default withCheckPermission(
  {
    checker: async ({ params }: RootChatParams) => {
      const chatId = params.id;
      const allowed = await withFGA({
        user: "user:*",
        object: `chat:${chatId}`,
        relation: "can_view",
      });

      if (!allowed && (await isCurrentUserInvitedToChat(chatId))) {
        await setCurrentUserAsReader(chatId);
        return true;
      }

      return allowed;
    },
    onUnauthorized: ({ params }: RootChatParams) => (
      <ChatProvider chatId={params.id} readOnly={true}>
        <Header />
        <ErrorContainer message="The conversation does not exist or you are not authorized to access it." />
      </ChatProvider>
    ),
  },
  RootLayout
);
