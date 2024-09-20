"use client";

import UserProfile from "@/components/auth0/user-profile";
import { Claims } from "@auth0/nextjs-auth0";

export function ProfilePage({ user }: { user: Claims }) {
  return <UserProfile user={user} />;
}
