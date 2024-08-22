import { NextApiRequest, NextApiResponse } from "next";

import { handle3rdPartyParams } from "@/sdk/auth0/3rd-party-apis";
import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

export const GET = handleAuth({
  login: async (req: NextApiRequest, res: NextApiResponse) => {
    const url = new URL(req.url!);
    const returnTo = url.searchParams.get("return_to") || "";

    return await handleLogin(req, res, {
      returnTo,
      authorizationParams: await handle3rdPartyParams(req),
    });
  },
});
