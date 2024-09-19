import { sql } from "./sql";

export const track = async (userID: string, tokens: number) => {
  await sql`
    INSERT INTO token_usage (user_id, tokens_used)
    VALUES (${userID}, ${tokens});
  `;

  return getUsage(userID);
}

export const getUsage = async (userID: string) => {
  const result = await sql`
    SELECT
      SUM(tokens_used) FILTER (WHERE timestamp > NOW() - INTERVAL '1 hour') AS hour,
      SUM(tokens_used) FILTER (WHERE timestamp > NOW() - INTERVAL '1 day') AS day
    FROM token_usage
    WHERE user_id = ${userID}
  `;

  return {
    lastHour: result[0].hour,
    lastDay: result[0].day
  };
};

const dailyLimit = process.env.DAILY_TOKEN_LIMIT ? parseInt(process.env.DAILY_TOKEN_LIMIT, 10) : Infinity;
const hourlyLimit = process.env.HOURLY_TOKEN_LIMIT ? parseInt(process.env.HOURLY_TOKEN_LIMIT, 10) : Infinity;
const unthrottledUsers = process.env.UNTHROTTLED_USERS ? process.env.UNTHROTTLED_USERS.split(",") : [];

export const hasAvailableTokens = async (userID: string): Promise<Boolean> => {
  const stats = await getUsage(userID);
  if (unthrottledUsers.includes(userID)) {
    return true;
  }
  return stats.lastDay <= dailyLimit &&
    stats.lastHour <= hourlyLimit;
}
