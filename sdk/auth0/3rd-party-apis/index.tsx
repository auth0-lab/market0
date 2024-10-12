import { getGoogleConnectionName } from "@/lib/utils";
import { getSession } from "@auth0/nextjs-auth0";

import * as box from "./providers/box";
import * as google from "./providers/google";

const PROVIDERS_APIS = [
  {
    name: "google",
    api: "google-calendar",
    requiredScopes: ["https://www.googleapis.com/auth/calendar.events"],
  },
  {
    name: "google",
    api: "google-all",
    requiredScopes: ["https://www.googleapis.com/auth/calendar.events"],
  },
  {
    name: "box",
    api: "box-write",
    requiredScopes: ["root_readwrite"],
  },
];

type ProviderContext = {
  isAPIAccessEnabled: boolean;
  containsRequiredScopes: boolean;
};

export type Context = {
  google: ProviderContext;
  box: ProviderContext;
};

type AvailableProviders = "google" | "box";

export type Provider = {
  name: AvailableProviders;
  api: string;
  requiredScopes: string[];
};

type With3PartyApisParams = {
  providers: Provider[];
};

const providerMapper = {
  google: async (requiredScopes: string[]) => {
    const provider: ProviderContext = {
      isAPIAccessEnabled: false,
      containsRequiredScopes: false,
    };

    const accessToken = await google.getAccessToken();
    if (accessToken) {
      provider.containsRequiredScopes = await google.verifyAccessToken(accessToken, requiredScopes);
    }

    provider.isAPIAccessEnabled = !!accessToken;
    return provider;
  },
  box: async () => {
    const provider: ProviderContext = {
      isAPIAccessEnabled: false,
      containsRequiredScopes: false,
    };

    const accessToken = await box.getAccessToken();
    if (accessToken) {
      provider.isAPIAccessEnabled = true;
      provider.containsRequiredScopes = true; // TODO: find a way to validate required scopes
    }

    return provider;
  },
};

export async function getThirdPartyContext(params: With3PartyApisParams) {
  const context: Context = {
    google: {
      isAPIAccessEnabled: false,
      containsRequiredScopes: false,
    },
    box: {
      isAPIAccessEnabled: false,
      containsRequiredScopes: false,
    },
  };

  for (const provider of params.providers) {
    context[provider.name] = await providerMapper[provider.name](provider.requiredScopes);
  }

  return context;
}

export async function handle3rdPartyParams(thirdPartyApi: string) {
  const session = await getSession();
  const user = session?.user;
  let authorizationParams = {};

  const provider = PROVIDERS_APIS.find((provider) => provider.api === thirdPartyApi || provider.name === thirdPartyApi);

  switch (provider?.name) {
    case "google":
      authorizationParams = {
        connection: getGoogleConnectionName(),
        connection_scope: provider?.requiredScopes.join(),
        access_type: "offline",
        login_hint: user?.email,
      };
      break;
    case "box":
      authorizationParams = {
        connection: "box",
        connection_scope: provider?.requiredScopes.join(),
        access_type: "offline",
        login_hint: user?.email,
      };
      break;
  }

  return authorizationParams;
}
