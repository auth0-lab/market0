import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { CredentialsMethod, OpenFgaClient, TypeName } from "@openfga/sdk";
import stocks from "../../lib/market/stocks.json";
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
  // 01. WRITE MODEL
  const model = await fgaClient.writeAuthorizationModel({
    schema_version: "1.1",
    type_definitions: [
      { type: "user" },
      {
        type: "asset",
        relations: {
          can_buy: {
            difference: {
              base: { this: {} },
              subtract: { computedUserset: { relation: "restricted" } },
            },
          },
          can_sell: {
            difference: {
              base: { this: {} },
              subtract: { computedUserset: { relation: "restricted" } },
            },
          },
          can_view: { this: {} },
          restricted: {
            union: {
              child: [
                { computedUserset: { relation: "_restricted_user" } },
                { computedUserset: { relation: "_restricted_employee" } },
              ],
            },
          },
          _restricted_employee: { this: {} },
          _restricted_user: { this: {} },
        },
        metadata: {
          relations: {
            can_buy: {
              directly_related_user_types: [
                { type: "user" },
                { type: "user", wildcard: {} },
              ],
            },
            can_sell: {
              directly_related_user_types: [
                { type: "user" },
                { type: "user", wildcard: {} },
              ],
            },
            can_view: {
              directly_related_user_types: [
                { type: "user" },
                { type: "user", wildcard: {} },
              ],
            },
            restricted: { directly_related_user_types: [] },
            _restricted_employee: {
              directly_related_user_types: [
                {
                  type: "company",
                  condition: "is_trading_window_closed",
                  relation: "employee",
                },
              ],
            },
            _restricted_user: {
              directly_related_user_types: [
                { type: "user", condition: "is_trading_window_closed" },
              ],
            },
          },
        },
      },
      {
        type: "company",
        relations: { employee: { this: {} } },
        metadata: {
          relations: {
            employee: { directly_related_user_types: [{ type: "user" }] },
          },
        },
      },
      {
        type: "doc",
        relations: { can_view: { this: {} }, owner: { this: {} } },
        metadata: {
          relations: {
            can_view: {
              directly_related_user_types: [
                { type: "user" },
                { type: "user", wildcard: {} },
              ],
            },
            owner: { directly_related_user_types: [{ type: "user" }] },
          },
        },
      },
      {
        type: "chat",
        relations: { can_view: { this: {} }, owner: { this: {} } },
        metadata: {
          relations: {
            can_view: {
              directly_related_user_types: [
                { type: "user" },
                { type: "user", wildcard: {} },
              ],
            },
            owner: { directly_related_user_types: [{ type: "user" }] },
          },
        },
      },
    ],
    conditions: {
      is_trading_window_closed: {
        name: "is_trading_window_closed",
        expression: "current_time > to || current_time < from",
        parameters: {
          current_time: { type_name: TypeName.Timestamp },
          from: { type_name: TypeName.Timestamp },
          to: { type_name: TypeName.Timestamp },
        },
      },
    },
  });

  console.log("NEW MODEL ID: ", model.authorization_model_id);

  // 02. REMOVE EXISTING TUPLES
  const readTuples = await fgaClient.read({});

  if (readTuples.tuples.length > 0) {
    await fgaClient.deleteTuples(readTuples.tuples.map((tuple) => tuple.key));
  }
  const earningsReports = await documents.query("earning");
  // 03. WRITE TUPLES
  await fgaClient.write(
    {
      writes: [
        ...(
          earningsReports.map((report) => ({
            user: "user:*",
            relation: "can_view",
            object: `doc:${report.metadata.id}`,
          }))
        ),

        ...(
          stocks.map((stock) => [
            {
              user: "user:*",
              relation: "can_buy",
              object: `asset:${stock.symbol.toLowerCase()}`,
            },
            {
              user: "user:*",
              relation: "can_sell",
              object: `asset:${stock.symbol.toLowerCase()}`,
            },
            {
              user: "user:*",
              relation: "can_view",
              object: `asset:${stock.symbol.toLowerCase()}`,
            },
          ]).flat()
        ),

        // Company Stock Restriction
        {
          user: "company:atko#employee",
          relation: "_restricted_employee",
          object: "asset:atko",
          condition: {
            name: "is_trading_window_closed",
            context: {
              from: "2023-01-01T00:00:00Z",
              to: "2023-02-01T00:00:00Z",
            },
          },
        },

        // ATKO employee
        {
          user: `user:${process.env.RESTRICTED_USER_ID_EXAMPLE}`,
          relation: "employee",
          object: "company:atko",
        },
      ],
    },
    {
      authorizationModelId: model.authorization_model_id,
    }
  );

  process.exit(0);
})();
