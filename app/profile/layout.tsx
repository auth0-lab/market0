import { Header } from "@/components/chat/header";

type ProfileLayoutParams = Readonly<{
  children: React.ReactNode;
}>;

export default async function ProfileLayout({ children }: ProfileLayoutParams) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
