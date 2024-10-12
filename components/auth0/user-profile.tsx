"use client";

import clsx, { ClassValue } from "clsx";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useConnectedAccounts from "@/hooks/auth0/use-connected-accounts";
import { getGoogleConnectionName } from "@/lib/utils";

import BasicInfoForm from "./basic-info-form";
import ConnectedAccounts from "./connected-accounts";

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
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">User Profile</h2>
          <p className="text-muted-foreground text-sm sm:text-base font-light">Info about you and your preferences.</p>
        </div>
        <Separator className="my-6 hidden sm:inline-block" />
        <div className="flex flex-col space-y-2 sm:space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 mt-4 sm:mt-0">
          <aside className="lg:w-1/5">
            <nav
              className={
                "flex space-x-1 lg:flex-col lg:space-x-0 lg:space-y-1 justify-start w-full bg-[#F1F5F9] sm:bg-transparent rounded-lg sm:rounded-none p-1.5 sm:p-0"
              }
            >
              {[
                { title: "General", id: "basic-info" },
                { title: "Accounts", id: "connected-accounts" },
              ].map((item) => (
                <button
                  onClick={handleItemClick(item.id)}
                  type="button"
                  key={item.id}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    currentItem === item.id
                      ? "bg-white hover:bg-white sm:bg-muted sm:hover:bg-muted"
                      : "sm:hover:bg-transparent sm:hover:underline text-[#64748B] sm:text-black",
                    "justify-start",
                    "px-3 py-1.5",
                    "flex-1 justify-center sm:justify-start"
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
                    connection: getGoogleConnectionName(),
                    displayName: "Google",
                    api: "google-all",
                    description: "Create and manage events in your Google Calendar.",
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
