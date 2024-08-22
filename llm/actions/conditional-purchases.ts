"use server";

import { ConditionalPurchase, getByID } from "@/lib/db/conditional-purchases";
import { getUser } from "@/sdk/fga";

export async function getConditionalPurchaseById(
  id: string
): Promise<ConditionalPurchase | null> {
  "use server";
  const user = await getUser();
  return getByID(user.sub, id);
}
