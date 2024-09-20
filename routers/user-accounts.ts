import {
  DeleteUserIdentityByUserIdProviderEnum,
  ManagementClient,
} from "auth0";
import { NextResponse } from "next/server";

import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";

import { withRateLimit } from "@/hooks/auth0/helpers/rate-limit";

const auth0 = new ManagementClient({
  domain: new URL(process.env.AUTH0_ISSUER_BASE_URL!).host,
  clientId: process.env.AUTH0_CLIENT_ID_MGMT!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET_MGMT!,
});

export function handleUserAccountsFetch() {
  return withRateLimit(
    withApiAuthRequired(async (): Promise<NextResponse> => {
      try {
        const session = await getSession();
        const mainUserId = session?.user.sub;
        const response = await auth0.users.get({ id: mainUserId });
        const { data } = response;

        return NextResponse.json(
          data.identities.map(
            ({ connection, provider, user_id: userId }, idx) => ({
              connection,
              provider,
              userId,
              isPrimary: idx === 0,
            })
          ),
          {
            status: response.status,
          }
        );
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          { error: "Error fetching user accounts" },
          { status: 500 }
        );
      }
    })
  );
}

export function handleDeleteUserAccount() {
  return withRateLimit(
    withApiAuthRequired(
      async (request: Request, { params }: any): Promise<NextResponse> => {
        try {
          const {
            provider,
            user_id,
          }: {
            provider: DeleteUserIdentityByUserIdProviderEnum;
            user_id: string;
          } = params;
          const session = await getSession();
          const mainUserId = session?.user.sub;

          const response1 = await auth0.users.unlink({
            id: mainUserId,
            provider,
            user_id,
          });

          if (response1.status !== 200) {
            return NextResponse.json({
              status: response1.status,
            });
          }

          const response2 = await auth0.users.delete({
            id: `${provider}|${user_id}`,
          });

          return NextResponse.json({
            status: response2.status,
          });
        } catch (error) {
          console.error(error);
          return NextResponse.json(
            { error: "Error deleting user account" },
            { status: 500 }
          );
        }
      }
    )
  );
}
