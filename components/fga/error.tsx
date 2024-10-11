"use client";

import { cn } from "@/lib/utils";

import { SimplePlusIcon } from "../icons";
import { Button } from "../ui/button";

const DottedContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gray-100 h-fit w-full rounded-md border border-dashed border-gray-300 p-8">{children}</div>
);

const UnautorizedIcon = () => {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M28.9733 24L18.3067 5.33333C18.0741 4.92294 17.7368 4.58158 17.3292 4.34409C16.9217 4.1066 16.4584 3.98147 15.9867 3.98147C15.5149 3.98147 15.0517 4.1066 14.6441 4.34409C14.2365 4.58158 13.8992 4.92294 13.6667 5.33333L3 24C2.76491 24.4071 2.64164 24.8692 2.64268 25.3393C2.64372 25.8095 2.76904 26.271 3.00593 26.6771C3.24282 27.0832 3.58286 27.4194 3.99159 27.6518C4.40032 27.8841 4.86321 28.0042 5.33333 28H26.6667C27.1345 27.9995 27.594 27.876 27.999 27.6417C28.404 27.4075 28.7403 27.0708 28.974 26.6655C29.2077 26.2602 29.3307 25.8005 29.3306 25.3326C29.3305 24.8648 29.2073 24.4052 28.9733 24Z"
        fill="#DFE4EA"
        stroke="#020617"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 12V17.3333" stroke="#020617" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 22.6667H16.0133" stroke="#020617" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export function ErrorContainer({
  title,
  message,
  icon,
  action,
}: {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    className?: string;
  };
}) {
  const finalAction =
    action !== undefined
      ? action
      : {
          label: "Create New Chat",
          onClick: () => (window.location.href = "/"),
          icon: <SimplePlusIcon />,
          className: "",
        };
  return (
    <main
      className="flex flex-col h-full overflow-hidden mx-auto items-center justify-center max-w-[768px]"
      style={{ maxHeight: "calc(100vh - 56px)" }}
    >
      <DottedContainer>
        <div className="flex flex-col items-center justify-center gap-10 py-10">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="bg-gray-300 p-5 rounded-2xl">{icon || <UnautorizedIcon />}</div>
            <h2 className="text-base leading-5 font-semibold text-gray-900">{title || "Not Authorized"}</h2>
            <p className="text-sm">{message || "You are not authorized to access the requested information."}</p>
          </div>
          {finalAction && (
            <Button
              variant="default"
              className={cn("py-2 px-4 m-0 text-sm font-light flex gap-2", finalAction.className)}
              onClick={() => finalAction.onClick()}
            >
              {finalAction.icon}
              {finalAction.label}
            </Button>
          )}
        </div>
      </DottedContainer>
    </main>
  );
}
