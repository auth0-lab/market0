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
    h2: ({ children }) => <h2 className="text-base text-gray-500 flex gap-1 mb-4">{children}</h2>,
    strong: ({ children }) => <strong className="font-medium text-black">{children}</strong>,
    p: ({ children }) => <p className="text-gray-500 text-sm block">{children}</p>,
    code: ({ children }) => <CodeBlock>{children}</CodeBlock>,

    Auth0Icon: () => <Auth0Icon className="h-5" />,
    UseCase,
    ...components,
  };
}
