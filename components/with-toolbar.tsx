"use client";

import { useEffect, useRef, useState } from "react";

import { ExplanationMeta, ExplanationType, useObservable } from "@/components/explanation/observable";
import { Button } from "@/components/ui/button";

export function WithToolbar({ children }: { children: React.ReactNode }) {
  const { setExplanation } = useObservable();
  const [currentExplanation, setCurrentExplanation] = useState<ExplanationMeta>(null);
  const ref = useRef<HTMLDivElement>(null);

  function handleClick() {
    if (currentExplanation) {
      currentExplanation.expand = true;
      setExplanation(currentExplanation);
    }
  }

  function updateExplanation($element: HTMLDivElement) {
    const data = $element.querySelector("[data-explanation]")?.getAttribute("data-explanation");
    setCurrentExplanation({ type: data as ExplanationType });
  }

  useEffect(() => {
    const $element = ref.current;

    if ($element) {
      updateExplanation($element);

      const observer = new MutationObserver(() => {
        updateExplanation($element);
      });

      observer.observe($element, { childList: true, subtree: true });
    }
  }, []);

  return (
    <div ref={ref} className="flex flex-col gap-3">
      <div className="w-full font-light text-stone-600 flex items-center text-sm sm:text-base">{children}</div>

      {currentExplanation?.type && (
        <div>
          <Button variant="secondary" onClick={handleClick} className="hidden sm:flex gap-2 text-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M13.8333 0.5H2.16667C1.24619 0.5 0.5 1.24619 0.5 2.16667V13.8333C0.5 14.7538 1.24619 15.5 2.16667 15.5H13.8333C14.7538 15.5 15.5 14.7538 15.5 13.8333V2.16667C15.5 1.24619 14.7538 0.5 13.8333 0.5Z"
                stroke="#020617"
                strokeWidth="0.886667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.5 0.5V15.5"
                stroke="#020617"
                strokeWidth="0.886667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.66663 5.5L12.1666 8L9.66663 10.5"
                stroke="#020617"
                strokeWidth="0.833333"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            How does this work?
          </Button>
        </div>
      )}
    </div>
  );
}
