"use client";

import { useActions, useUIState } from "ai/rsc";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ClientMessage, Document } from "@/llm/types";

import { FormattedText } from "../FormattedText";
import { NotAvailableReadOnly } from "../not-available-read-only";
import { PromptUserContainer } from "../prompt-user-container";
import WarningWrapper from "../warning-wrapper";

export const Documents = ({
  documents,
  text,
  symbol,
  finished,
  readOnly = false,
}: {
  documents: Document[];
  text: string;
  symbol: string;
  finished: boolean;
  readOnly?: boolean;
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
    <WarningWrapper className="max-w-xl" readOnly={readOnly}>
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
        {showEnrollment &&
          finished &&
          (readOnly ? (
            <NotAvailableReadOnly containerClassName="mt-4" />
          ) : (
            <PromptUserContainer
              title="Join Market0 Newsletter"
              description="To get access to analyst forecasts join the newsletter"
              action={{
                label: "Join",
                onClick: enroll,
              }}
              readOnly={readOnly}
              containerClassName="mt-4"
            />
          ))}
      </div>
    </WarningWrapper>
  );
};
