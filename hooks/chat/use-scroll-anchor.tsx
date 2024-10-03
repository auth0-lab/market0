/**
 * Use scroll anchore React hook
 *
 * This is a simple scroll hook based on:
 *   - https://github.com/vercel/ai-chatbot/blob/main/lib/hooks/use-scroll-anchor.tsx
 */
import { generateId } from "ai";
import { isBefore } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";

export const useScrollAnchor = () => {
  const messagesRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibilityRef = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    }
  }, []);

  // this is for the initial scroll right after load
  useEffect(() => {
    const current = messagesRef.current;
    if (current) {
      if (isAtBottom && !isVisible) {
        messagesRef.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        });
      }
    }
  }, [isAtBottom, isVisible]);

  // Introducing a resize observer for the chat messages block
  useEffect(() => {
    const current = messagesRef.current;
    if (!current) {
      return;
    }

    const id = generateId();

    const observer = new ResizeObserver(() => {
      console.log("resize event captured", {
        w: messagesRef?.current?.offsetWidth,
        h: messagesRef?.current?.offsetHeight,
      });

      setIsAtBottom(true);
    });

    console.log("connecting resize observer", id);
    observer.observe(current);

    return () => {
      console.log("disconnected resize observer", id);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const { current } = scrollRef;

    if (current) {
      const id = generateId();
      const handleScroll = (event: Event) => {
        const target = event.target as HTMLDivElement;
        const offset = 100;
        const isAtBottom =
          target.scrollTop + target.clientHeight >=
          target.scrollHeight - offset;

        setIsAtBottom(isAtBottom);
      };

      console.log("listening to scroll events", id);
      current.addEventListener("scroll", handleScroll, {
        passive: true,
      });

      return () => {
        console.log("removing scroll event listener", id);
        current.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    if (visibilityRef.current) {
      const id = generateId();
      let observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
            } else {
              setIsVisible(false);
            }
          });
        },
        {
          rootMargin: "0px 0px -100px 0px",
        }
      );

      console.log("creating a new observer", id);
      observer.observe(visibilityRef.current);

      return () => {
        console.log("disconnecting scond observer", id);
        observer.disconnect();
      };
    }
  }, []);

  return {
    messagesRef,
    scrollRef,
    visibilityRef,
    scrollToBottom,
    isAtBottom,
    isVisible,
  };
};
