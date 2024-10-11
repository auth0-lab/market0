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
