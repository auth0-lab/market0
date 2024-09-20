import { useCallback } from "react";

export default function useConnectedAccounts() {
  const fetchConnectedAccounts = useCallback(async (): Promise<{
    connectedAccounts?: {
      provider: string;
      connection: string;
      isPrimary: boolean;
    }[];
    status: number;
  }> => {
    try {
      const response = await fetch("/api/auth/user/accounts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // TODO: Better handling rate limits
      if (response.status === 429) {
        return { status: 429 };
      }

      return {
        connectedAccounts: await response.json(),
        status: response.status,
      };
    } catch (error) {
      console.error(error);
      return { status: 500 };
    }
  }, []);

  const deleteUserAccount = useCallback(
    async (
      connection: string
    ): Promise<{
      status: number;
    }> => {
      try {
        const response1 = await fetch("/api/auth/user/accounts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // TODO: Better handling rate limits
        if (response1.status === 429) {
          return { status: 429 };
        }

        const accounts = await response1.json();
        const { provider, userId } = accounts.find(
          (acc: { connection: string }) => acc.connection === connection
        );

        const response2 = await fetch(
          `/api/auth/user/accounts/${provider}/${userId}`,
          {
            method: "DELETE",
          }
        );

        // TODO: Better handling rate limits
        if (response2.status === 429) {
          return { status: 429 };
        }

        return { status: response2.status };
      } catch (error) {
        console.error(error);
        return { status: 500 };
      }
    },
    []
  );

  return { fetchConnectedAccounts, deleteUserAccount };
}
