import { Header } from "@/components/chat/header";

import { Content } from "./content";

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export default function Page({ params: { id } }: { params: { id: string } }) {
  return (
    <div className="flex flex-col h-full w-full">
      <Header allowLogin={false} />
      <Content id={id} />
    </div>
  );
}
