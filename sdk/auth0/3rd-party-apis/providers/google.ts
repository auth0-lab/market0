"use server";

import { getSession } from "@auth0/nextjs-auth0";

const fetchAccessToken = async (auth0IdToken: string): Promise<string> => {
  const res = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
      subject_token: auth0IdToken,
      requested_token_type: "http://auth0.com/oauth/token-type/google-social-access-token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Unable to get a Google API access token: ${await res.text()}`);
  }

  const { access_token } = await res.json();
  return access_token;
};

export async function verifyAccessToken(accessToken: string, scopesToCheck: string[] | string): Promise<boolean> {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`);

  if (!res.ok) {
    console.log(`Unable to verify Google API access token: ${await res.text()}`);
    return false;
  }

  const tokenInfo = await res.json();
  const tokenScopes = tokenInfo.scope.split(" ");

  return (Array.isArray(scopesToCheck) ? scopesToCheck : [scopesToCheck]).every((scope) => tokenScopes.includes(scope));
}

export async function getAccessToken() {
  "use server";
  const session = await getSession();
  const auth0IdToken = session?.idToken!;
  let accessToken = undefined;

  try {
    accessToken = await fetchAccessToken(auth0IdToken);
    return accessToken;
  } catch (e) {
    console.error(e);
  }

  return accessToken;
}

export async function withGoogleApi(fn: (accessToken: string) => Promise<any>) {
  const accessToken = await getAccessToken();
  return await fn(accessToken!);
}
