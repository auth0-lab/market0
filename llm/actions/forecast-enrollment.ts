'use server';

import { fgaClient, getUser } from "@/sdk/fga";

/**
 * Enrolls the current user to receive forecasts for a list of symbols.
 */
export async function enrollToForecasts() {
  const user = await getUser();
  const symbols = ['AAPL', 'GOOGL', 'TSLA', 'AMZN', 'MSFT', 'NVDA', 'INTC', 'AMD'];

  await fgaClient.write(
    {
      writes: symbols.map(symbol => ({
        user: `user:${user.sub}`,
        relation: "can_view",
        object: `doc:forecast-${symbol}`,
      })),
    }
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

  const { allowed } = await fgaClient.check({
    user: `user:${user.sub}`,
    object: `doc:forecast-${symbol}`,
    relation: "can_view",
  });

  return allowed;
}
