import { getSession } from "@auth0/nextjs-auth0";
// https://docs.fga.dev/modeling/basics/custom-roles
import {
  ClientCheckRequest,
  CredentialsMethod,
  OpenFgaClient,
} from "@openfga/sdk";

const host = process.env.FGA_API_HOST || "api.us1.fga.dev";

export const fgaClient = new OpenFgaClient({
  apiScheme: "https",
  apiHost: host,
  storeId: process.env.FGA_STORE_ID,
  credentials: {
    method: CredentialsMethod.ClientCredentials,
    config: {
      apiTokenIssuer: "fga.us.auth0.com",
      apiAudience: `https://${host}/`,
      clientId: process.env.FGA_CLIENT_ID!,
      clientSecret: process.env.FGA_CLIENT_SECRET!,
    },
  },
});

type CheckPermissionParams = {
  user: string;
  object: string;
  relation: string;
  context?: object;
};

async function checkPermission({
  user,
  object,
  relation,
  context,
}: CheckPermissionParams): Promise<boolean> {
  const check: ClientCheckRequest = {
    user,
    object,
    relation,
  };

  if (context) {
    check.context = context;
  }

  const { allowed } = await fgaClient.check(check);

  return !!allowed;
}

export async function getUser() {
  const session = await getSession();
  return session?.user!;
}

/**
 * @param params
 * @param [params.user] - The user to check permissions for. If not provided, the current user is used.
 * @param params.object - The object to check permissions for.
 * @param params.relation - The relation to check permissions for.
 * @param [params.context] - The context to check permissions for.
 */
export type withFGAParams = {
  user?: string;
  object: string;
  relation: string;
  context?: object;
};

export async function withFGA(params: withFGAParams) {
  const checkPermissionsParams = params as CheckPermissionParams;

  if (params.user === undefined) {
    const user = await getUser();
    checkPermissionsParams.user = `user:${user.sub as string}`;
  }

  return await checkPermission(checkPermissionsParams);
}
