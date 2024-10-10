"use client";

import { PromptUserContainer } from "@/llm/components/prompt-user-container";

export const ConnectGoogleAccount = ({
  title,
  description,
  api,
  readOnly = false,
}: {
  title: string;
  description: string;
  api: string;
  readOnly?: boolean;
}) => {
  return (
    <PromptUserContainer
      title={title}
      description={description}
      action={{
        label: "Connect",
        onClick: () => {
          window.location.href = `/api/auth/login?3rdPartyApi=${api}&linkWith=google-oauth2&returnTo=${window.location.pathname}`;
        },
      }}
      readOnly={readOnly}
    />
  );
};
