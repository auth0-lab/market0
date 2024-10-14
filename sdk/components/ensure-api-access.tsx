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
    icon?: ReactNode;
    title: string;
    description: string;
    action?: { label: string };
  };
  onUserAuthorized?: () => Promise<void>;
  shouldCheckAuthorization: boolean | ShouldCheckAuthorizationHandler;
  readOnly?: boolean;
};

export function EnsureAPIAccess({
  children,
  provider,
  connectWidget: { title, description, icon, action },
  onUserAuthorized,
  shouldCheckAuthorization,
  readOnly,
}: EnsureAPIAccessProps) {
  const [isWorking, setIsWorking] = useState(true);
  const [isLoginRequired, setLoginRequired] = useState(false);

  const init = useCallback(async () => {
    const shouldCheck =
      typeof shouldCheckAuthorization === "function" ? await shouldCheckAuthorization() : shouldCheckAuthorization;

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
        icon={icon}
        action={action}
        api={provider.api || provider.name}
        readOnly={readOnly}
      />
    );
  }

  return <>{children}</>;
}
