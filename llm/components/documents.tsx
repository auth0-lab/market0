"use client";

import { useActions, useUIState } from "ai/rsc";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ClientMessage, Document } from "@/llm/types";

import { FormattedText } from "./FormattedText";
import WarningWrapper from "./warning-wrapper";

export const Documents = ({
  documents,
  text,
  symbol,
  finished,
}: {
  documents: Document[];
  text: string;
  symbol: string;
  finished: boolean;
}) => {
  const [showEnrollment, setShowEnrollment] = useState(false);

  const { checkEnrollment } = useActions();
  const { continueConversation } = useActions();
  const [, setMessages] = useUIState();

  useEffect(() => {
    checkEnrollment({ symbol }).then((isEnrolled?: Boolean) => {
      setShowEnrollment(!isEnrolled);
    });
  }, [symbol]);

  const enroll = () => {
    setShowEnrollment(false);
    (async () => {
      const response = await continueConversation({
        message: `Subscribe me to the newsletter. Once done ASK me if I want to read the forecast analysis for ${symbol}.`,
        hidden: true,
      });
      setMessages((prevMessages: ClientMessage[]) => [...prevMessages, response]);
    })();
  };

  return (
    <WarningWrapper className="max-w-xl">
      <div className="p-4 rounded-2xl bg-white">
        <FormattedText content={text} />
        {documents.length > 0 && finished && (
          <div className="flex flex-row gap-0 mt-1">
            {documents.map((document: Document, index: number) => (
              <div key={document.metadata.id} className="text-xs">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={document.metadata.link ?? `/report/${document.metadata.id}`}
                        target="_black"
                        rel="noopener noreferrer"
                        className="cursor-pointer"
                      >
                        <span className="font-mono text-gray-500 text-[0.65rem]">[{index + 1}]</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-sans">{document.metadata.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        )}
        {showEnrollment && finished && (
          <div className="border border-gray-300 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-0 items-center w-full justify-between mt-5">
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <h3 className="font-semibold text-sm sm:text-base leading-6 text-stone-700">Join Market0 Newsletter</h3>
              <p className="text-xs sm:text-sm font-normal leading-5">
                To get access to analyst forecasts join the newsletter.
              </p>
            </div>
            <div className="w-full sm:w-fit">
              <button
                onClick={() => enroll()}
                className="w-full sm:w-fit bg-gray-200 text-black whitespace-nowrap rounded-md text-sm font-normal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 hover:text-white py-2 px-4 transition-all duration-300"
              >
                Join
              </button>
            </div>
          </div>
        )}
      </div>
    </WarningWrapper>
  );
};
