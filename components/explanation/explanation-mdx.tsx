/* eslint-disable @next/next/no-img-element */

import React, { ReactNode } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";

import { GHIcon } from "../icons";

type ExplanationImages = "3rd-party-apis";

const AvailableImages: Record<ExplanationImages, string> = {
  "3rd-party-apis": "https://cdn.auth0.com/website/labs/ai/market0/3rd-party-apis.png",
};

export function UseCase({ type }: { type: ExplanationImages }) {
  return (
    <div className="flex border-t border-gray-200 h-fit py-5">
      <div className="flex flex-col gap-3">
        <span className="text-sm text-gray-700 text-center">Learn more</span>
        <img src={AvailableImages[type]} width="230" height="336" alt="example image" className="ml-4" />
      </div>
    </div>
  );
}

SyntaxHighlighter.registerLanguage("jsx", jsx);

export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <div className="shadow-sm rounded-lg bg-white border border-gray-100 my-5">
      <div className="h-10 border-b border-gray-100 flex items-center px-3 justify-between font-sans">
        <div className="flex items-center text-sm text-black">calendar-events.tsx</div>
        <div className="flex gap-2 items-center">
          <a
            href="#"
            className="flex gap-1 items-center hover:underline text-xs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GHIcon />
            View Code
          </a>
        </div>
      </div>
      <div className="max-h-[400px] overflow-y-auto overscroll-y-none max-w-[100%] rounded-lg">
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
