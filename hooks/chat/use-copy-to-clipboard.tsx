"use client";

/**
 * Copy to Clipboard Hook
 *
 * This is a simple react hook based on:
 *   - https://github.com/vercel/ai-chatbot/blob/main/lib/hooks/use-copy-to-clipboard.tsx
 */

import * as React from "react";

export interface useCopyToClipboardProps {
  timeout?: number;
}

export function useCopyToClipboard({
  timeout = 2000,
}: useCopyToClipboardProps) {
  const [isCopied, setIsCopied] = React.useState<boolean>(false);

  const copyToClipboard = async (value: string) => {
    if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }

    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, timeout);
  };

  return { isCopied, copyToClipboard };
}
