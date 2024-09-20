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
      requested_token_type:
        "http://auth0.com/oauth/token-type/box-access-token",
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Unable to get a Box API access token: ${await res.text()}`
    );
  }

  const { access_token } = await res.json();
  return access_token;
};

export async function getAccessToken() {
  "use server";
  const session = await getSession();
  const auth0IdToken = session?.idToken!;
  let accessToken = undefined;

  try {
    accessToken = await fetchAccessToken(auth0IdToken);
    return accessToken;
  } catch (e) {}

  return accessToken;
}

export async function withBoxApi(fn: (accessToken: string) => Promise<any>) {
  const accessToken = await getAccessToken();
  return await fn(accessToken!);
}
