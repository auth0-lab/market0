import { AI } from "@/app/actions";
import { getHistory } from "@/llm/actions/history";

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: {
    id: string
  };
}>) {
  const messages = await getHistory(params.id);

  return (
    <AI initialAIState={messages} conversationID={params.id}>{children}</AI>
  );
}
