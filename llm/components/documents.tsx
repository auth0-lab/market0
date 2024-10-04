"use client";

import { useActions, useUIState } from "ai/rsc";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ExternalLink } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
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
  const { continueConversation }= useActions();
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
      const response = await continueConversation(
        {
          message: `Thank me for subscribing to the newsletter and ask me if I would like to see the forecast for ${symbol} now.`,
          hidden: true
        }
      );
      setMessages((prevMessages: ClientMessage[]) => [
        ...prevMessages,
        response,
      ]);
    })();
  };

  return (
    <WarningWrapper>
      <div className="p-8 rounded-2xl bg-white">
        <FormattedText content={text} />
        {documents.length > 0 && finished && (
          <div className="flex flex-row gap-2 mt-4">
            {documents.map((document: Document) => (
              <Badge
                key={document.metadata.id}
                variant="outline"
                className="font-normal pl-3"
              >
                <Link
                  href={document.metadata.link ?? `/report/${document.metadata.id}`}
                  target="_black"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex items-center gap-4 py-2 px-3 pr-1 justify-between"
                >
                  {document.metadata.title}
                  <ExternalLink />
                </Link>
              </Badge>
            ))}
          </div>
        )}
        {showEnrollment && finished && (
          <p>
            <button
              onClick={() => enroll()}
              className="whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-black border shadow hover:bg-primary/90 hover:text-white h-9 py-1 px-2"
            >
              Join our newsletter
            </button>{" "}
            to get access to analyst forecasts.
          </p>
        )}
      </div>
    </WarningWrapper>
  );
};
