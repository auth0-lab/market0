"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";

import { getThirdPartyContext, Provider } from "../auth0/3rd-party-apis";
import { ConnectGoogleAccount } from "./connect-google-account";
import Loader from "./loader";

type ShouldCheckAuthorizationHandler = () => boolean | Promise<boolean>;

type EnsureAPIAccessProps = {
  children: ReactNode;
  provider: Provider;
  connectWidget: {
    title: string;
    description: string;
  };
  onUserAuthorized?: () => Promise<void>;
  shouldCheckAuthorization: boolean | ShouldCheckAuthorizationHandler;
};

export function EnsureAPIAccess({
  children,
  provider,
  connectWidget: { title, description },
  onUserAuthorized,
  shouldCheckAuthorization,
}: EnsureAPIAccessProps) {
  const [isWorking, setIsWorking] = useState(true);
  const [isLoginRequired, setLoginRequired] = useState(false);

  const init = useCallback(async () => {
    const shouldCheck =
      typeof shouldCheckAuthorization === "function"
        ? await shouldCheckAuthorization()
        : shouldCheckAuthorization;

    if (shouldCheck) {
      const ctx = await getThirdPartyContext({
        providers: [
          {
            name: provider.name,
            api: provider.api,
            requiredScopes: provider.requiredScopes,
          },
        ],
      });

      if (!ctx.google.containsRequiredScopes) {
        setLoginRequired(true);
      } else {
        setLoginRequired(false);

        if (typeof onUserAuthorized === "function") {
          await onUserAuthorized();
        }
      }
    }

    setIsWorking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  if (isWorking) {
    return <Loader />;
  }

  if (isLoginRequired) {
    return (
      <ConnectGoogleAccount
        title={title}
        description={description}
        api={provider.api || provider.name}
      />
    );
  }

  return <>{children}</>;
}
