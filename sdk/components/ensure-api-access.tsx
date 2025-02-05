"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { getGoogleConnectionName, setAsyncInterval } from "@/lib/utils";
import { PromptUserContainer } from "@/llm/components/prompt-user-container";

import { getThirdPartyContext, Provider } from "../auth0/3rd-party-apis";
import Loader from "./loader";

type EnsureAPIAccessProps = {
  children: ReactNode;
  provider: Provider;
  connectWidget: {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: { label: string };
  };
  onUserAuthorized?: () => Promise<void>;
  readOnly?: boolean;
};

export function EnsureAPIAccess({
  children,
  provider,
  connectWidget: { title, description, icon, action },
  onUserAuthorized,
  readOnly,
}: EnsureAPIAccessProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginRequired, setLoginRequired] = useState(false);
  const [loginPopup, setLoginPopup] = useState<Window | null>(null);

  // check if the session has the current scope
  const getHasRequiredScopes = useCallback(async () => {
    const ctx = await getThirdPartyContext({
      providers: [
        {
          name: provider.name,
          api: provider.api,
          requiredScopes: provider.requiredScopes,
        },
      ],
    });
    return ctx.google.containsRequiredScopes;
  }, [provider]);

  //Trigger the component callback to load state when the user is authorized
  useEffect(() => {
    if (isLoginRequired || !onUserAuthorized) {
      return;
    }
    onUserAuthorized();
  }, [isLoginRequired, onUserAuthorized]);

  //Poll for the login process until the popup is closed
  // or the user is authorized
  useEffect(() => {
    if (!loginPopup) {
      return;
    }
    const cancelPolling = setAsyncInterval(async () => {
      const hasRequiredScopes = await getHasRequiredScopes();
      if (!loginPopup || loginPopup.closed || hasRequiredScopes) {
        setLoginRequired(!hasRequiredScopes);
        cancelPolling();
        setIsLoading(false);
        setLoginPopup(null);
      }
    }, 1000);
    return () => {
      if (cancelPolling) {
        cancelPolling();
      }
    };
  }, [loginPopup, getHasRequiredScopes]);

  //Open the login popup
  const startLoginPopup = useCallback(async () => {
    const params = new URLSearchParams({
      "3rdPartyApi": provider.api,
      linkWith: getGoogleConnectionName(),
      returnTo: "/close",
    });
    const url = `/api/auth/login?${params.toString()}`;
    const windowFeatures = "width=800,height=650,status=no,toolbar=no,menubar=no";
    const popup = window.open(url, "_blank", windowFeatures);
    if (!popup) {
      console.error("Popup blocked by the browser");
      return;
    } else {
      setLoginPopup(popup);
      setIsLoading(true);
    }
  }, [provider]);

  //Load the initial state
  useEffect(() => {
    (async () => {
      const hasRequiredScopes = await getHasRequiredScopes();
      setLoginRequired(!hasRequiredScopes);
      setIsLoading(false);
    })();
  }, [getHasRequiredScopes]);

  if (isLoading) {
    return <Loader />;
  }

  if (isLoginRequired) {
    return (
      <PromptUserContainer
        title={title}
        description={description}
        icon={icon}
        action={{
          label: action?.label ?? "Connect",
          onClick: startLoginPopup,
        }}
        readOnly={readOnly}
      />
    );
  }

  return <>{children}</>;
}
