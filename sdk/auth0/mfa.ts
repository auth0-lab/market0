"use server";

import { ManagementClient } from "auth0";

import { getSession } from "@auth0/nextjs-auth0";

export async function isGuardianEnrolled() {
  try {
    const client = new ManagementClient({
      domain: new URL(process.env.AUTH0_ISSUER_BASE_URL!).host,
      clientId: process.env.AUTH0_CLIENT_ID_MGMT!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET_MGMT!,
    });
    const session = await getSession();
    const user_id = session?.user.sub;

    const response = await client.users.getAuthenticationMethods({
      id: user_id,
    });
    const { data } = response;

    return !!data?.find((m) => m.type === "guardian");
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function requireGuardianEnrollment() {
  try {
    const client = new ManagementClient({
      domain: new URL(process.env.AUTH0_ISSUER_BASE_URL!).host,
      clientId: process.env.AUTH0_CLIENT_ID_MGMT!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET_MGMT!,
    });
    const session = await getSession();
    const user_id = session?.user.sub;

    const user = await client.users.get({ id: user_id });
    const app_metadata = user.data.app_metadata || {};

    app_metadata.requires_mfa = true;

    await client.users.update({ id: user_id }, { app_metadata });
  } catch (error) {
    console.error(error);
  }
}
