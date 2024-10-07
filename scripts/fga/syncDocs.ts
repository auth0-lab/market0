import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { CredentialsMethod, OpenFgaClient } from "@openfga/sdk";
import { documents } from "../..//lib/db";

const fgaClient = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL,
  storeId: process.env.FGA_STORE_ID,
  authorizationModelId: process.env.FGA_MODEL_ID,
  credentials: {
    method: CredentialsMethod.ClientCredentials,
    config: {
      apiTokenIssuer: process.env.FGA_API_TOKEN_ISSUER || "",
      apiAudience: process.env.FGA_API_AUDIENCE || "",
      clientId: process.env.FGA_CLIENT_ID || "",
      clientSecret: process.env.FGA_CLIENT_SECRET || "",
    },
  },
});

(async function main() {
  console.log("Configuring earning reports tuples...");

  const earningsReports = await documents.query("earning");

  await fgaClient.write({
    writes: [
      ...earningsReports.map((report) => ({
        user: "user:*",
        relation: "can_view",
        object: `doc:${report.metadata.id}`,
      })),
    ],
  });

  process.exit(0);
})();
