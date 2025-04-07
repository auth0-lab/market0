import { NextApiRequest, NextApiResponse } from "next";

import { handle3rdPartyParams } from "@/sdk/auth0/3rd-party-apis";
import { linkUser } from "@/sdk/auth0/mgmt";
import { getSession, handleAuth, handleCallback, handleLogin, LoginOptions } from "@auth0/nextjs-auth0";

export const GET = handleAuth({
  login: async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession();
    const user = session?.user;

    const url = new URL(req.url!);
    const thirdPartyApi = url.searchParams.get("3rdPartyApi") || "";
    const linkWith = url.searchParams.get("linkWith");
    const screenHint = url.searchParams.get("screenHint");

    const authorizationParams = {
      ...(screenHint && { screen_hint: screenHint }),
      ...(thirdPartyApi && (await handle3rdPartyParams(thirdPartyApi))),
      ...(linkWith && {
        connection: linkWith,
        login_hint: user?.email,
      }),
    };

    return await handleLogin(req, res, {
      authorizationParams,
      async getLoginState(_req: any, options: LoginOptions) {
        if (linkWith) {
          // store user id to be used during linking account from next login callback
          return user && { primaryUserId: user.sub, secondaryProvider: linkWith };
        }

        return {};
      },
    });
  },
  callback: handleCallback({
    afterCallback: async (_req: any, session: any, state: { [key: string]: any }) => {
      const { primaryUserId, secondaryProvider } = state;
      const { user } = session;

      if (primaryUserId && primaryUserId !== user.sub) {
        console.log(`linking ${primaryUserId} with ${user.sub}`);

        // TODO: this approach is allowing multiple identities for the same connection, should we restrict it to 1 identity per connection?
        let identityToAdd = {
          provider: secondaryProvider,
          user_id: user.sub,
        };

        // adding this because we have multiple google connections
        if (
          identityToAdd.provider === process.env.NEXT_PUBLIC_GOOGLE_CONNECTION_NAME &&
          process.env.GOOGLE_CONNECTION_ID
        ) {
          identityToAdd.provider = "google-oauth2";
          // @ts-ignore
          identityToAdd.connection_id = process.env.GOOGLE_CONNECTION_ID;
        }

        await linkUser(primaryUserId, identityToAdd);

        // force a silent login to get a fresh session for the updated user profile
        state.returnTo = `/api/auth/login?returnTo=${encodeURI(state.returnTo)}`;
      }

      return session;
    },
  }),
});
