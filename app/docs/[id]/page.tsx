import { Header } from "@/components/chat/header";

import { Content } from "./content";

import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  // read route params
  const id = (await params).id;

  const cardMapper: Record<string, string> = {
    "call-apis-on-users-behalf": "https://cdn.auth0.com/website/labs/ai/assets/use-case-2-card.png",
    "authorization-for-rag": "https://cdn.auth0.com/website/labs/ai/assets/use-case-3-card.png",
    "async-user-confirmation": "https://cdn.auth0.com/website/labs/ai/assets/use-case-4-card.png",
  };

  const image = cardMapper[id] || cardMapper["call-apis-on-users-behalf"];

  return {
    title: "Auth0 AI | Market0",
    description: "Market0 is a demo app that showcases secure auth patterns for GenAI apps",
    alternates: {
      canonical: `${process.env.AUTH0_BASE_URL}/docs/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      site: "@auth0",
      creator: "@auth0",
      title: "Auth0 AI | Market0",
      description: "Market0 is a demo app that showcases secure auth patterns for GenAI apps",
      images: {
        url: image,
        width: 1200,
        height: 630,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Auth0 AI | Market0",
      title: "Auth0 AI | Market0",
      description: "Market0 is a demo app that showcases secure auth patterns for GenAI apps",
      locale: "en",
      url: `${process.env.AUTH0_BASE_URL}/docs/${id}`,
      images: {
        url: image,
        secureUrl: image,
        width: 1200,
        height: 630,
      },
    },
  };
}

export default function Page({ params: { id } }: { params: { id: string } }) {
  return (
    <div className="flex flex-col h-full w-full">
      <Header allowLogin={false} />
      <Content id={id} />
    </div>
  );
}
