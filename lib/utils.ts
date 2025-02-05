import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export const runAsyncFnWithoutBlocking = (fn: (...args: any) => Promise<any>) => {
  fn();
};

export function getGoogleConnectionName() {
  return process.env.NEXT_PUBLIC_GOOGLE_CONNECTION_NAME || "google-oauth2";
}

/**
 *
 * A simple sleep function that resolves after a given number of milliseconds.
 *
 * @param ms - The number of milliseconds to sleep
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 *
 * Create an interval that runs an async function.
 * The interval is counted from the end of the previous function call.
 *
 * @param fn - The async function to run
 * @param interval - The interval in milliseconds
 * @returns - A function to stop the interval
 */
export function setAsyncInterval(fn: () => Promise<void>, interval: number): () => void {
  let stopped = false;
  async function runner() {
    while (!stopped) {
      await fn();
      if (!stopped) {
        await sleep(interval);
      }
    }
  }
  runner();
  return () => { stopped = true; };
}
