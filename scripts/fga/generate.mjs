import dotenv from "dotenv";
import { CredentialsMethod, OpenFgaClient, TypeName } from "@openfga/sdk";

dotenv.config({ path: ".env.local" });

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

  // 03. WRITE TUPLES
  await fgaClient.write(
    {
      writes: [
        // NVDA:1st Quarter 2025 Doc
        {
          user: "user:*",
          relation: "can_view",
          object: "doc:gFPKKADh5HEwckh3br36Sm",
        },
        // NVDA:2nd Quarter 2024 Doc
        {
          user: "user:*",
          relation: "can_view",
          object: "doc:xih1ux26z9SicARvmcZJYj",
        },
        // OKTA stock
        {
          user: "user:*",
          relation: "can_buy",
          object: "asset:okta",
        },
        {
          user: "user:*",
          relation: "can_sell",
          object: "asset:okta",
        },
        {
          user: "user:*",
          relation: "can_view",
          object: "asset:okta",
        },
        // NVDA stock
        {
          user: "user:*",
          relation: "can_buy",
          object: "asset:nvda",
        },
        {
          user: "user:*",
          relation: "can_sell",
          object: "asset:nvda",
        },
        {
          user: "user:*",
          relation: "can_view",
          object: "asset:nvda",
        },
        // Company Stock Restriction
        {
          user: "company:okta#employee",
          relation: "_restricted_employee",
          object: "asset:okta",
          condition: {
            name: "is_trading_window_closed",
            context: {
              from: "2023-01-01T00:00:00Z",
              to: "2023-02-01T00:00:00Z",
            },
          },
        },
        // OKTA employee
        {
          user: `user:${process.env.RESTRICTED_USER_ID_EXAMPLE}`,
          relation: "employee",
          object: "company:okta",
        },
      ],
    },
    {
      authorizationModelId: model.authorization_model_id,
    }
  );
})();
