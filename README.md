# Market0

This is a demo of an interactive financial assistant. It can show you stocks, tell you their prices, and even help you buy shares.

## Getting Started

### Prerequisites

- An Auth0 account, you can create one [here](https://auth0.com/signup).
- An OKTA FGA account, you can create one [here](https://dashboard.fga.dev).
- An OpenAI account and API key create one [here](https://platform.openai.com).
- Docker to run the postgresql container.

### FGA Configuration

To setup OKTA FGA for the sample, navigate to OKTA's FGA dashboard and follow these easy-to-follow configuration steps:

#### 01. Update The Authorization Model

```yaml
model
  schema 1.1

type user

type assets
  relations
    define trader: [user]
    define viewer: [user] or trader
```

#### 02. Use Relationship Tuples To Tie The Users To The Roles

```ts
write(
  [
    // UserID is assigned the viewer for stocks
    {
      user: "user:auth0|xxxxxxxxxxxxxxx",
      object: "assets:stocks",
      relation: "trader",
    },
    // UserID is assigned the trader for stocks
    {
      user: "user:auth0|xxxxxxxxxxxxxxx",
      object: "assets:stocks",
      relation: "viewer",
    },
  ],
  (authorization_model_id = "xxxxxxxxxxxxxxx")
);
```

### Setup

1. Clone this repository to your local machine.
2. Install the dependencies by running `npm install` in your terminal.
3. Set up the environment [variables](#enviroment-variables).
4. Start the database `npm run db:up`.
5. Run `npm run dev`.

### Enviroment Variables

For running the sample, you'll need to have the following values in your `.env.local`.

```bash
# A long, secret value used to encrypt the session cookie
AUTH0_SECRET='LONG_RANDOM_VALUE'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='YOUR_AUTH0_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_AUTH0_CLIENT_SECRET'

FGA_STORE_ID='YOUR_FGA_STORE_ID'
FGA_MODEL_ID='YOUR_FGA_MODEL_ID'
FGA_CLIENT_ID='YOUR_FGA_CLIENT_ID'
FGA_CLIENT_SECRET='YOUR_FGA_CLIENT_SECRET'

OPENAI_API_KEY='YOUR_OPENAI_API_KEY'

PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=market0
PGPORT=5442
```

You can execute the following command to generate a suitable string for the `AUTH0_SECRET` value:

```bash
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

### Running the Project

To start the development server, run `npm run dev` in your terminal. Open [http://localhost:3000](http://localhost:3000) to view the chatbot in your browser.

## License

Apache-2.0
