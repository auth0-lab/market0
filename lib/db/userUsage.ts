import { LanguageModelUsage } from "ai";

import { sql } from "./sql";

export const track = async (
  userID: string,
  usage: number | LanguageModelUsage | Promise<LanguageModelUsage>
) => {
  let tokens = 0;
  if (typeof usage === "number") {
    tokens = usage;
  } else {
    tokens = (await usage).totalTokens;
  }
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
const unlimitedUsers = process.env.UNLIMITED_USERS ? process.env.UNLIMITED_USERS.split(",") : [];

export const hasAvailableTokens = async (userID: string, email: string): Promise<Boolean> => {
  if (unlimitedUsers.includes(email) || unlimitedUsers.includes(userID)) {
    return true;
  }
  const stats = await getUsage(userID);
  if (unthrottledUsers.includes(userID)) {
    return true;
  }
  return stats.lastDay <= dailyLimit &&
    stats.lastHour <= hourlyLimit;
}
