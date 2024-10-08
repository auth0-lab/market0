import { Header } from "@/components/chat/header";

type ReportLayoutParams = Readonly<{
  children: React.ReactNode;
}>;

export default async function ReportLayout({ children }: ReportLayoutParams) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
