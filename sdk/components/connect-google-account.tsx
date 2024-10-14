"use client";

import { getGoogleConnectionName } from "@/lib/utils";
import { PromptUserContainer } from "@/llm/components/prompt-user-container";

export const ConnectGoogleAccount = ({
  title,
  description,
  icon,
  action,
  api,
  readOnly = false,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: { label: string };
  api: string;
  readOnly?: boolean;
}) => {
  return (
    <>
      <PromptUserContainer
        title={title}
        description={description}
        icon={icon}
        action={{
          label: action?.label ?? "Connect",
          onClick: () => {
            window.location.href = `/api/auth/login?3rdPartyApi=${api}&linkWith=${getGoogleConnectionName()}&returnTo=${
              window.location.pathname
            }`;
          },
        }}
        readOnly={readOnly}
      />
    </>
  );
};
