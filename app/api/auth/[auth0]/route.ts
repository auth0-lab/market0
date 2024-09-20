import { NextApiRequest, NextApiResponse } from "next";

import { handle3rdPartyParams } from "@/sdk/auth0/3rd-party-apis";
import {
  getSession,
  handleAuth,
  handleCallback,
  handleLogin,
  LoginOptions,
} from "@auth0/nextjs-auth0";

import { ManagementClient } from "auth0";
import _ from "lodash";

const auth0 = new ManagementClient({
  domain: new URL(process.env.AUTH0_ISSUER_BASE_URL!).host,
  clientId: process.env.AUTH0_CLIENT_ID_MGMT!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET_MGMT!,
});

export const GET = handleAuth({
  login: async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession();
    const user = session?.user;

    const url = new URL(req.url!);
    const thirdPartyApi = url.searchParams.get("3rdPartyApi") || "";
    const linkWith = url.searchParams.get("linkWith");

    const authorizationParams = {
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
          return (
            user && { primaryUserId: user.sub, secondaryProvider: linkWith }
          );
        }

        return {};
      },
    });
  },
  callback: handleCallback({
    afterCallback: async (
      _req: any,
      session: any,
      state: { [key: string]: any }
    ) => {
      const { primaryUserId, secondaryProvider } = state;
      const { user } = session;

      if (primaryUserId && primaryUserId !== user.sub) {
        console.log(`linking ${primaryUserId} with ${user.sub}`);

        // TODO: this approach is allowing multiple identities for the same connection, should we restrict it to 1 identity per connection?
        await auth0.users.link(
          { id: primaryUserId },
          { provider: secondaryProvider, user_id: user.sub }
        );

        // force a silent login to get a fresh session for the updated user profile
        state.returnTo = `/api/auth/login?returnTo=${encodeURI(
          state.returnTo
        )}`;
      }

      return session;
    },
  }),
});
