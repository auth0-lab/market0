/**
 * Use scroll to bottom React hook
 *
 * This is a simple scroll hook based on:
 *   - https://github.com/vercel/ai-chatbot/blob/2705d83d6cffdd8cde6679e5e6e4610e6eb71545/components/custom/use-scroll-to-bottom.ts
 */
import { RefObject, useEffect, useRef } from "react";

export function useScrollToBottom<T extends HTMLElement>(): [RefObject<T>, RefObject<T>] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        end.scrollIntoView({ behavior: "smooth", block: "end" });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return [containerRef, endRef];
}
