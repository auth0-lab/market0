"use server";

import { DeleteUserIdentityByUserIdProviderEnum, ManagementClient, PostIdentitiesRequestProviderEnum } from "auth0";

import { getSession } from "@auth0/nextjs-auth0";

const auth0 = new ManagementClient({
  domain: new URL(process.env.AUTH0_ISSUER_BASE_URL!).host,
  clientId: process.env.AUTH0_CLIENT_ID_MGMT!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET_MGMT!,
});

export async function isGuardianEnrolled() {
  try {
    const session = await getSession();
    const user_id = session?.user.sub;

    const response = await auth0.users.getAuthenticationMethods({
      id: user_id,
    });
    const { data } = response;

    return !!data?.find((m) => m.type === "guardian");
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getUser(userId: string) {
  return auth0.users.get({ id: userId });
}

export async function deleteUser(userId: string) {
  return auth0.users.delete({
    id: userId,
  });
}

export async function linkUser(
  userId: string,
  identityToAdd: {
    provider: PostIdentitiesRequestProviderEnum;
    user_id: string;
    connection_id?: string;
  }
) {
  await auth0.users.link({ id: userId }, identityToAdd);
}

export async function unlinkUser(
  userId: string,
  identityToRemove: {
    provider: DeleteUserIdentityByUserIdProviderEnum;
    user_id: string;
  }
) {
  return auth0.users.unlink({
    id: userId,
    ...identityToRemove,
  });
}

export async function updateUser(
  userId: string,
  { givenName, familyName }: { givenName?: string; familyName?: string }
) {
  return auth0.users.update(
    { id: userId },
    {
      given_name: givenName ?? undefined,
      family_name: familyName ?? undefined,
    }
  );
}
