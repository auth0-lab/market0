import { AI } from "@/app/actions";
import { getHistory } from "@/llm/actions/history";
import { UserProvider } from "@auth0/nextjs-auth0/client";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: {
    id: string;
  };
}>) {
  const messages = await getHistory(params.id);

  return (
    <AI initialAIState={messages} conversationID={params.id}>
      <UserProvider>{children}</UserProvider>
    </AI>
  );
}
