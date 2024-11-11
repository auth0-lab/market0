/* eslint-disable @next/next/no-img-element */
import type { MDXComponents } from "mdx/types";
import React from "react";

import { CodeBlock, UseCase } from "./components/explanation/explanation-mdx";
import { Auth0Icon } from "./components/icons";

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h2: ({ children }) => <h2 className="text-sm sm:text-xl text-black font-light flex gap-1 mb-4">{children}</h2>,
    h3: ({ children }) => (
      <h3 className="mt-5 text-sm sm:text-xl text-black font-medium flex gap-1 mb-4">{children}</h3>
    ),
    h4: ({ children }) => <h4 className="text-sm font-medium text-black flex gap-1 mb-4 pt-5">{children}</h4>,
    a: ({ children, href }) => (
      <a href={href} target="_blank" className="border-b border-gray-400">
        {children}
      </a>
    ),
    ol: ({ children }) => (
      <ol className="ml-5" style={{ listStyle: "auto" }}>
        {children}
      </ol>
    ),
    ul: ({ children }) => (
      <ul className="ml-5" style={{ listStyle: "disc" }}>
        {children}
      </ul>
    ),
    li: ({ children }) => <li className="text-sm sm:text-md my-3 text-gray-500 marker:text-black">{children}</li>,
    strong: ({ children }) => <strong className="font-medium text-black">{children}</strong>,
    p: ({ children }) => <p className="text-gray-500 text-sm sm:text-base block">{children}</p>,
    code: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    table: ({ children }) => <table className="border border-[#E2E8F0] text-gray-500 text-sm">{children}</table>,
    th: ({ children }) => <th className="border border-[#E2E8F0] px-5 text-left">{children}</th>,
    td: ({ children }) => <td className="border border-[#E2E8F0] px-5">{children}</td>,

    Auth0Icon: () => <Auth0Icon className="h-5" />,
    UseCase,
    CodeBlock,

    ...components,
  };
}
