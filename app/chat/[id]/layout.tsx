import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AI, fetchUserById } from "@/app/actions";
import { isChatOwner, isCurrentUserInvitedToChat, setCurrentUserAsReader } from "@/app/chat/[id]/actions";
import { ChatProvider } from "@/components/chat/context";
import ConversationPicker from "@/components/chat/conversation-picker";
import { Header } from "@/components/chat/header";
import { ShareConversation } from "@/components/chat/share";
import { ChatUsersPermissionsList } from "@/components/chat/share/users-permissions-list";
import { ErrorContainer } from "@/components/fga/error";
import { ArrowRightIcon } from "@/components/icons";
import { conversations } from "@/lib/db";
import { getUser, withFGA } from "@/sdk/fga";
import { withCheckPermission } from "@/sdk/fga/next/with-check-permission";

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

  if (!isOwner) {
    return redirect(`/read/${conversation.id}`);
  }

  const { messages, ownerID } = conversation;
  const ownerProfile = ownerID ? await fetchUserById(ownerID) : undefined;

  return (
    <ChatProvider chatId={params.id} readOnly={false} hasMessages={messages.length > 0} ownerProfile={ownerProfile}>
      <AI initialAIState={messages} conversationID={params.id} readOnly={false}>
        <div className="flex flex-col h-full w-full">
          <Header
            leftElements={
              <Link
                href="https://auth0.ai"
                target="_blank"
                className="hover:text-black transition-all duration-300 text-sm font-light text-slate-500 items-center gap-1 hidden sm:flex"
              >
                Learn about Auth for GenAI <ArrowRightIcon />
              </Link>
            }
            outerElements={<ConversationPicker selectedConversation={conversation} />}
          >
            {isOwner && (
              <ShareConversation>
                {/**
                 * Because of a rendering bug with server components and client
                 * components, we require passing the chatId at this instance
                 * instead of using the chatId from the context.
                 */}
                <ChatUsersPermissionsList chatId={params.id} />
              </ShareConversation>
            )}
          </Header>
          {children}
        </div>
      </AI>
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
