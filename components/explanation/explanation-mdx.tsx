/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import React, { ReactNode } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";

import { cn } from "@/lib/utils";

import { GHIcon } from "../icons";

const useCases = {
  "authenticate-users": {
    title: "Authenticate users",
    description:
      "Easily implement login experiences, tailor made for AI agents. Whether for chatbots or background agents.",
    image: "https://cdn.auth0.com/website/labs/ai/cards/card_2.png",
  },
  "call-apis": {
    title: "Call APIs on users' behalf",
    description:
      "Use secure standards to get API tokens for Google, Github and more... Seamlessly integrate your app with other products.",
    image: "https://cdn.auth0.com/website/labs/ai/cards/card_3.png",
  },
  "async-human": {
    title: "Async Human in the Loop",
    description: "Let your autonomous, async agents do work in the background. Request user permissions when needed.",
    image: "https://cdn.auth0.com/website/labs/ai/cards/card_1.png",
  },
  "authorization-rag": {
    title: "Authorization for RAG",
    description:
      "Only retrieve documents users have access to. Avoid leaking data to a user that should not have access to it.",
    image: "https://cdn.auth0.com/website/labs/ai/cards/card_4.png",
  },
};

export function UseCase({ type }: { type: string }) {
  const data = useCases[type as keyof typeof useCases];

  return (
    <div className="pb-5 mt-5">
      <div
        className={cn(
          "border border-[#E2E8F0] rounded-xl items-center w-full justify-between p-4 sm:p-6 flex flex-col sm:flex-row gap-6 sm:gap-2 bg-white"
        )}
      >
        <div className="w-full flex flex-col sm:flex-row justify-start items-center gap-4">
          <div className="flex flex-col gap-1 sm:gap-1.5 items-start w-full">
            <h2 className="grow text-sm sm:text-base leading-6 font-semibold">{data.title}</h2>
            <p className="grow text-xs sm:text-sm leading-5 font-light text-gray-500 max-w-xl">{data.description}</p>
          </div>
        </div>

        <div className="w-full sm:w-fit">
          <img src={data.image} alt={data.title} className="min-h-24 max-h-24 min-w-[200px] object-contain" />
        </div>
      </div>
    </div>
  );
}

SyntaxHighlighter.registerLanguage("jsx", jsx);

export function CodeBlock({
  children,
  title = "Example Usage",
  link,
}: {
  children: ReactNode;
  title?: string;
  link?: string;
}) {
  return (
    <div className="rounded-xl bg-[#E6E6EB] border border-[#E2E8F0]-100 my-5">
      <div className="h-10 border-b border-gray-100 flex items-center px-4 justify-between font-sans">
        <div className="flex items-center text-sm font-normal text-[#64748B]">{title}</div>
        {link && (
          <div className="flex gap-2 items-center">
            <a
              href={link}
              className="flex gap-1 items-center hover:underline text-sm text-[#64748B]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GHIcon />
              View Code
            </a>
          </div>
        )}
      </div>
      <div className="max-h-[400px] overflow-y-auto overscroll-y-none max-w-[100%] rounded-b-xl">
        <SyntaxHighlighter
          language="javascript"
          style={{ ...vs }}
          customStyle={{ margin: 0, border: "none" }}
          codeTagProps={{ style: { whiteSpace: "break-spaces", fontSize: "14px" } }}
          PreTag="div"
          CodeTag="div"
          showLineNumbers
        >
          {children as string}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
