"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

function Spinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2 animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  );
}

type Account = {
  connection: string;
  displayName: string;
  api?: string;
  description?: string;
};

type ConnectedAccount = {
  provider: string;
  connection: string;
  isPrimary: boolean;
};

type UserConnectedAccountsProps = {
  availableAccounts: Account[];
  connectedAccounts?: ConnectedAccount[] | undefined;
  allowLink?: boolean;
  onFetch: () => Promise<{
    connectedAccounts?: ConnectedAccount[];
    status: number;
  }>;
  onUnlink?: (connection: string) => Promise<{
    status: number;
  }>;
};

export default function ConnectedAccounts({
  availableAccounts,
  connectedAccounts,
  allowLink,
  onFetch,
  onUnlink,
}: UserConnectedAccountsProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [currentConnectedAccounts, setCurrentConnectedAccounts] =
    useState(connectedAccounts);
  const [fetching, setFetching] = useState(false);
  const [isLinkingAccount, setIsLinkingAccount] = useState<string | null>(null);
  const [isUnlinkingAccount, setIsUnlinkingAccount] = useState<string | null>(
    null
  );

  const handleFetchConnectedAccounts = useCallback(
    async function handleFetchSessions() {
      setFetching(true);
      const response = await onFetch();

      if (response.status !== 200) {
        return setFetching(false);
      }

      setCurrentConnectedAccounts(response.connectedAccounts);
      setFetching(false);
    },
    [onFetch]
  );

  useEffect(() => {
    (async () => {
      if (!connectedAccounts) {
        await handleFetchConnectedAccounts();
      }
    })();
  }, [connectedAccounts, handleFetchConnectedAccounts]);

  const handleLinkAccount = (connection: string, api?: string) => async () => {
    if (!allowLink) {
      return;
    }
    setIsLinkingAccount(connection);
    let redirectPath = `/api/auth/login?linkWith=${connection}&returnTo=${encodeURIComponent(
      "/profile#connected-accounts"
    )}`;

    if (api) {
      redirectPath += `&3rdPartyApi=${api}`;
    }

    router.push(redirectPath);
  };

  const handleUnlinkAccount = (connection: string) => async () => {
    if (!onUnlink) {
      return;
    }

    setIsUnlinkingAccount(connection);
    const response = await onUnlink(connection);
    if (response.status !== 200) {
      setIsUnlinkingAccount(null);

      return toast({
        title: "Info",
        description:
          "There was a problem unlinking the account. Try again later.",
      });
    }

    router.push(
      `/api/auth/login?returnTo=${encodeURIComponent(
        "/profile#connected-accounts"
      )}`
    );
  };

  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg font-normal"></CardTitle>
        <CardDescription>
          Connect your social accounts to access their information.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 p-4 pt-0 md:p-6 md:pt-0">
        {fetching && (
          <div className="flex w-full items-center justify-left">
            <Spinner />
            <span className="text-sm text-muted-foreground">
              Retrieving your connected accounts...
            </span>
          </div>
        )}

        {!currentConnectedAccounts && !fetching && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between space-x-2">
              <Label className="flex flex-col space-y-2">
                <p className="font-normal leading-snug text-muted-foreground max-w-fit">
                  There was a problem fetching your connected accounts. Try
                  again later.
                </p>
              </Label>
            </div>
          </div>
        )}

        {!fetching &&
          currentConnectedAccounts &&
          availableAccounts.map(
            (
              { connection, displayName, description, api }: Account,
              idx: number
            ) => {
              const isConnected = currentConnectedAccounts.some(
                (cca) => cca.connection === connection
              );

              const isMainConnection =
                connection === currentConnectedAccounts[0]?.connection;

              return (
                <div
                  key={`connection-${idx}-${connection}`}
                  className="flex flex-col gap-6"
                >
                  {idx > 0 && <Separator />}
                  <div
                    key={connection}
                    className="flex flex-col md:flex-row items-center justify-between md:space-x-2 space-y-6 md:space-y-0"
                  >
                    <Label className="flex flex-col space-y-1">
                      <span className="leading-6">{displayName}</span>
                      {description && (
                        <p className="font-normal leading-snug text-muted-foreground max-w-fit">
                          {description}
                        </p>
                      )}
                    </Label>
                    <div className="flex space-x-24 items-center justify-end md:min-w-24">
                      {isConnected ? (
                        <>
                          {onUnlink && (
                            <Button
                              className="h-fit min-w-24"
                              variant="outline"
                              onClick={handleUnlinkAccount(connection)}
                              disabled={
                                isUnlinkingAccount === connection ||
                                isMainConnection
                              }
                            >
                              {isUnlinkingAccount === connection && <Spinner />}
                              Disconnect
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          className="h-fit min-w-24"
                          variant="outline"
                          disabled={
                            !allowLink || isLinkingAccount === connection
                          }
                          onClick={handleLinkAccount(connection, api)}
                        >
                          {isLinkingAccount === connection && <Spinner />}
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
      </CardContent>
    </Card>
  );
}
