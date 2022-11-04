# Kfone Customer Support

Customer Support portal of the Kfone demo telecommunication company.

## Prerequisites

Install Node.JS LTS from https://nodejs.org/en/download/. Then install **pnpm** as the package manager from https://pnpm.io/installation.

Verify if you have the LTS version installed.

```bash
node -v # should be something like v16.x
npm -v # should be something like v8.x
pnpm -v # should be something like v7.x
```

## Setup

```bash
git clone git@github.com:yathindrak/kfone-customer-support.git

cd customer-support
```
&nbsp;
##### Let's setup the environment variables.

Get a copy of the `.env.example` file and rename it as .env. Then change the below values, as per the description provided in each .env variable.

```json
NODE_ENV=development
REACT_APP_ASGARDEO_CLIENT_ID=<CLIENT ID TAKEN FROM ASGARDEO CONSOLE>
REACT_APP_ASGARDEO_BASE_URL=<BASE URL TAKEN FROM ASGARDEO CONSOLE>
REACT_APP_ASGARDEO_CALLBACK_URL=<CALLBACK URL AFTER A SUCCESSFUL AUTHENTICATION>
REACT_APP_CHOREO_CLIENT_ID=<CONSUMER ID TAKEN FROM ASGARDEO CONSOLE>
REACT_APP_BASE_API_ENDPOINT=<BASE URL OF CHOREO HOSTED API>
REACT_APP_CHOREO_ORGANIZATION=<ORGANIZATION OF CHOREO HOSTED API>
REACT_APP_CHOREO_TOKEN_ENDPOINT=<CHOREO TOKEN ENDPOINT>
```

PS: If you want to deploy this app(eg. vercel), make sure you added the relevent environment variables there as well. In this case, the `REACT_APP_ASGARDEO_CALLBACK_URL` should be changed based on the web app domain name.

## Install Dependencies

From the project root, install dependencies using the below command.

```bash
pnpm install
```

## Bootstrap Application


```bash
pnpm start
```

The application should be up and running in port 3000 🎉
