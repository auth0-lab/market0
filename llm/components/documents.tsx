"use client";

import { useActions, useUIState } from "ai/rsc";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const { checkEnrollment, enrollToNewsletter } = useActions();
  const { continueConversation } = useActions();
  const [, setMessages] = useUIState();

  useEffect(() => {
    checkEnrollment({ symbol }).then((isEnrolled?: Boolean) => {
      setShowEnrollment(!isEnrolled);
    });
    // TODO: verify this. checkEnrollment keeps changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  const enroll = () => {
    enrollToNewsletter();
    setShowEnrollment(false);
    (async () => {
      const response = await continueConversation({
        message: `Thank me for subscribing to the newsletter and ask me if I would like to see the forecast for ${symbol} now.`,
        hidden: true,
      });
      setMessages((prevMessages: ClientMessage[]) => [
        ...prevMessages,
        response,
      ]);
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
                        href={
                          document.metadata.link ??
                          `/report/${document.metadata.id}`
                        }
                        target="_black"
                        rel="noopener noreferrer"
                        className="cursor-pointer"
                      >
                        <span className="font-mono text-gray-500 text-[0.65rem]">
                          [{index + 1}]
                        </span>
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
          <div className="border border-gray-300 rounded-xl p-6 flex items-center w-full justify-between mt-5">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-semibold text-base leading-6 text-stone-700">
                Join Market0 Newsletter
              </h3>
              <p className="text-sm font-normal leading-5">
                To get access to analyst forecasts join the newsletter.
              </p>
            </div>
            <div>
              <button
                onClick={() => enroll()}
                className="bg-gray-200 text-black whitespace-nowrap rounded-md text-sm font-normal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 hover:text-white py-2 px-4 transition-all duration-300"
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
