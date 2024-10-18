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
          <Button variant="secondary" onClick={handleClick} className="flex gap-2 text-sm">
            <svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 0.533333C0 0.238784 0.238784 0 0.533333 0H9.06667C9.36117 0 9.6 0.238784 9.6 0.533333V12.2667C9.6 12.4606 9.49483 12.6391 9.32523 12.7331C9.15563 12.8271 8.94837 12.8217 8.784 12.7189L4.8 10.2289L0.816 12.7189C0.651595 12.8217 0.444363 12.8271 0.274795 12.7331C0.105216 12.6391 0 12.4606 0 12.2667V0.533333ZM1.06667 1.06667V11.3044L4.23467 9.32437C4.58055 9.10827 5.01945 9.10827 5.36533 9.32437L8.53333 11.3044V1.06667H1.06667Z"
                fill="#020617"
              />
            </svg>
            Explain
          </Button>
        </div>
      )}
    </div>
  );
}
