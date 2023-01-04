# Kfone Customer Support

Customer Support portal of the Kfone demo telecommunication company. This includes;
  - Personal user information and cases
  - Enterprise user and prospect information and cases

## Prerequisites

Install Node.JS LTS from https://nodejs.org/en/download/.

Verify if you have the LTS version installed.

```bash
node -v
npm -v
```

## Setup

```bash
git clone https://github.com/wso2/devrel.git

git checkout Kubecon-demos

cd kfone-customer-support
```
&nbsp;
##### Let's setup the environment variables.

Get a copy of the `.env.example` file and rename it as .env. Then change the below values, as per the description provided in each .env variable.

```json
NODE_ENV=development
HTTPS=true
PORT=3000
REACT_APP_ASGARDEO_CLIENT_ID=<CLIENT ID OF THE OIDC APPLICATION REGISTERED IN ASGARDEO>
REACT_APP_ASGARDEO_BASE_URL=<BASE URL OF THE ASGARDEO API ENDPOINT (Eg. https://api.asgardeo.io/t/kfone)>
REACT_APP_ASGARDEO_CALLBACK_URL=<CALLBACK URL (Eg. https://localhost:3000)>
REACT_APP_CHOREO_CLIENT_ID=<CONSUMER ID OF THE APPLICATION REGISTERED IN CHOREO>
REACT_APP_BASE_API_ENDPOINT=<BASE URL OF CHOREO HOSTED API>
REACT_APP_CHOREO_ORGANIZATION=<ORGANIZATION OF CHOREO HOSTED API>
REACT_APP_CHOREO_TOKEN_ENDPOINT=<CHOREO TOKEN ENDPOINT>
```

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
