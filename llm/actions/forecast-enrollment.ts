'use server';
import { documents } from "@/lib/db";
import { fgaClient, getUser } from "@/sdk/fga";

/**
 * Enrolls the current user to receive forecasts for a list of symbols.
 */
export async function enrollToForecasts() {
  const user = await getUser();
  const docs = await documents.query("forecast");
  await fgaClient.write(
    {
      writes: docs.map(doc => ({
        user: `user:${user.sub}`,
        relation: "can_view",
        object: `doc:${doc.metadata.id}`,
      })),
    }
  );
}

export async function unenrollFromForecasts() {
  const user = await getUser();
  const docs = await documents.query("forecast");
  await fgaClient.deleteTuples(
    docs.map(doc => ({
      user: `user:${user.sub}`,
      relation: "can_view",
      object: `doc:${doc.metadata.id}`,
    }))
  );
}

/**
 *
 * Checks if the current user is enrolled to receive forecasts for a given symbol.
 *
 * @param param0
 * @param param0.symbol - The symbol to check enrollment for.
 * @returns A boolean indicating if the user is enrolled to receive forecasts for the given symbol.
 */
export async function checkEnrollment({ symbol }: { symbol: string }) {
  const user = await getUser();
  const docs = await documents.query("forecast", symbol);
  if (docs.length === 0) { return false; }

  //Test if the user is allowed to view any forecast.
  const { allowed } = await fgaClient.check({
    user: `user:${user.sub}`,
    object: `doc:${docs[0].metadata.id}`,
    relation: "can_view",
  });

  return allowed;
}
