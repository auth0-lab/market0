import { NextApiRequest } from "next";

import { getSession } from "@auth0/nextjs-auth0";

import {
  getGoogleAccessToken,
  isGoogleUser,
  verifyAccessToken,
} from "./providers/google";

const PROVIDERS_APIS = [
  {
    name: "google",
    api: "google-calendar",
    requiredScopes: ["https://www.googleapis.com/auth/calendar.events"],
  },
  {
    name: "google",
    api: "google-tasks",
    requiredScopes: ["https://www.googleapis.com/auth/tasks"],
  },
];

type ProviderContext = {
  userBelongsToProvider: boolean;
  isAPIAccessEnabled: boolean;
  containsRequiredScopes: boolean;
};

export type Context = {
  google: ProviderContext;
};

type AvailableProviders = "google";

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
      userBelongsToProvider: false,
      isAPIAccessEnabled: false,
      containsRequiredScopes: false,
    };
    const accessToken = await getGoogleAccessToken();

    if (accessToken) {
      provider.containsRequiredScopes = await verifyAccessToken(
        accessToken,
        requiredScopes
      );
    }

    provider.userBelongsToProvider = await isGoogleUser();
    provider.isAPIAccessEnabled = !!accessToken;

    return provider;
  },
};

export async function getThirdPartyContext(params: With3PartyApisParams) {
  const context: Context = {
    google: {
      userBelongsToProvider: false,
      isAPIAccessEnabled: false,
      containsRequiredScopes: false,
    },
  };

  for (const provider of params.providers) {
    context[provider.name] = await providerMapper[provider.name](
      provider.requiredScopes
    );
  }

  return context;
}

export async function handle3rdPartyParams(req: NextApiRequest) {
  const session = await getSession();
  const user = session?.user;
  const url = new URL(req.url!);
  const thirdPartyApi = url.searchParams.get("3rd_party_api");
  let authorizationParams = {};

  const provider = PROVIDERS_APIS.find(
    (provider) =>
      provider.api === thirdPartyApi || provider.name === thirdPartyApi
  );

  switch (thirdPartyApi) {
    case "google-calendar":
      authorizationParams = {
        connection: "google-oauth2",
        connection_scope: provider?.requiredScopes.join(),
        access_type: "offline",
        login_hint: user?.email,
      };
      break;
    case "google-tasks":
      authorizationParams = {
        connection: "google-oauth2",
        connection_scope: provider?.requiredScopes.join(),
        access_type: "offline",
        login_hint: user?.email,
      };
      break;
  }

  return authorizationParams;
}
