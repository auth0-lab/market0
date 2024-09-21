const startAuthenticationRequest = async (
  userId: string,
  scope: string = "openid"
): Promise<{
  authReqId: string;
  expiresIn: number;
  interval: number;
}> => {
  const res = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/bc-authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH0_CLIENT_ID!,
      client_secret: process.env.AUTH0_CLIENT_SECRET!,
      scope,
      login_hint: JSON.stringify({
        format: "iss_sub",
        iss: `${process.env.AUTH0_ISSUER_BASE_URL!}/`,
        sub: userId,
      }),
    }).toString(),
  });

  if (!res.ok) {
    throw new Error(
      `Unable to start a CIBA Authentication Request: ${await res.text()}`
    );
  }

  const {
    auth_req_id: authReqId,
    expires_in: expiresIn,
    interval,
  } = await res.json();

  return { authReqId, expiresIn, interval };
};

const getToken = async (
  authReqId: string
): Promise<
  | {
      accessToken: string;
      idToken: string;
      expiresIn: number;
      scope: string;
    }
  | undefined
> => {
  const res = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      grant_type: "urn:openid:params:grant-type:ciba",
      auth_req_id: authReqId,
    }),
  });

  if (!res.ok) {
    if (res.status < 500) {
      const { error } = await res.json();
      if (error === "authorization_pending") {
        return;
      }
    }

    throw new Error(
      `Unable to get a CIBA Authentication Result: ${await res.text()}`
    );
  }

  const {
    access_token: accessToken,
    id_token: idToken,
    expires_in: expiresIn,
    scope,
  } = await res.json();

  return { accessToken, idToken, expiresIn, scope };
};

export async function pollMode(
  userId: string,
  scope: string = "openid"
): Promise<{
  accessToken: string;
  idToken: string;
  expiresIn: number;
  scope: string;
}> {
  let tokenResult;
  const { authReqId, interval } = await startAuthenticationRequest(
    userId,
    scope
  );

  do {
    tokenResult = await getToken(authReqId);
    if (!tokenResult) {
      await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    }
  } while (!tokenResult);

  return tokenResult;
}