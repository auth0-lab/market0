# Market0

This is a demo of an interactive financial assistant. It can show you stocks, tell you their prices, and even help you buy shares.

## Getting Started

### Prerequisites

- An Auth0 Lab account, you can create one [here](https://manage.auth0lab.com/).
- An OKTA FGA account, you can create one [here](https://dashboard.fga.dev).
- An OpenAI account and API key create one [here](https://platform.openai.com).
- Docker to run the postgresql container.

### FGA Configuration

To setup OKTA FGA for the sample, create a client with the following permissions:

- `Read/Write model, changes, and assertions`
- `Read and query`

### Auth0 Configuration

To setup your Auth0 Lab tenant for the sample, create two applications:

- **Regular Web Application**

  - **Allowed Callback URLs:** `http://localhost:3000/api/auth/callback`
  - **Allowed Logout URLs:** `http://localhost:3000`

- **Machine to Machine**
  - **API:** `Auth0 Management API`
  - **Permissions:** `read:users update:users delete:users read:authentication_methods`

Configure [Google](https://marketplace.auth0.com/integrations/google-social-connection) as social connections.

And enable MFA with [push notifications using Auth0 Guardian](https://auth0.com/docs/secure/multi-factor-authentication/auth0-guardian#enroll-in-push-notifications).

### Setup

1. Clone this repository to your local machine.
2. Install the dependencies by running `npm install` in your terminal.
3. Set up the environment variables making a copy of the [.env-example](./.env-example) file.
4. Start the database with `npm run db:up`
5. Configure your FGA store with `npm run fga:migrate:create`

### Running the Project

To start the development server, run `npm run dev` in your terminal. Open [http://localhost:3000](http://localhost:3000) to view the chatbot in your browser.

## License

Apache-2.0
