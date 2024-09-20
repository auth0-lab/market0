"use client";

import clsx, { ClassValue } from "clsx";
import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import BasicInfoForm from "./basic-info-form";
import ConnectedAccounts from "./connected-accounts";

import useConnectedAccounts from "@/hooks/auth0/use-connected-accounts";

interface KeyValueMap {
  [key: string]: any;
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function UserProfile({ user }: { user: KeyValueMap }) {
  const [currentItem, setCurrentItem] = useState("basic-info");
  useEffect(() => {
    setCurrentItem(window.location.hash.substring(1) || "basic-info");
  }, []);

  const { fetchConnectedAccounts, deleteUserAccount } = useConnectedAccounts();

  const handleItemClick = (id: string) => () => {
    setCurrentItem(id);
  };

  return (
    <div className="max-w-screen-lg mx-auto gap-5 md:gap-5 lg:gap-5 justify-center p-2 flex flex-col w-full">
      <div className="md:block">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">User Profile</h2>
          <p className="text-muted-foreground">
            Info about you and your preferences.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <nav
              className={
                "flex space-x-1 lg:flex-col lg:space-x-0 lg:space-y-1 justify-center"
              }
            >
              {[
                { title: "General", id: "basic-info" },
                { title: "Connected Accounts", id: "connected-accounts" },
              ].map((item) => (
                <button
                  onClick={handleItemClick(item.id)}
                  type="button"
                  key={item.id}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    currentItem === item.id
                      ? "bg-muted hover:bg-muted"
                      : "hover:bg-transparent hover:underline",
                    "justify-start",
                    "px-3 py-1.5"
                  )}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>
          <div className="flex-1">
            {currentItem === "basic-info" && <BasicInfoForm user={user} />}

            {currentItem === "connected-accounts" && (
              <ConnectedAccounts
                availableAccounts={[
                  {
                    connection: "Username-Password-Authentication",
                    displayName: "Username + Password",
                  },
                  {
                    connection: "box",
                    displayName: "Box",
                    api: "box-write",
                    description: "Upload files to your Box account.",
                  },
                  {
                    connection: "google-oauth2",
                    displayName: "Google",
                    api: "google-all",
                    description:
                      "Create and manage events and tasks in your Google Calendar and upload files to your Google Drive.",
                  },
                ]}
                allowLink={true}
                onFetch={fetchConnectedAccounts}
                onUnlink={deleteUserAccount}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
