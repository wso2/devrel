# Kfone website

Website of the Kfone demo telecommunication company. This includes;
  - Kfone landing page
  - My Kfone self service app
  - Enterprise user interactions
    - Downloading a whitepaper
    - Registering a webinar

## Prerequisites

Install Node.JS LTS from https://nodejs.org/en/download/

Verify if you have the LTS version installed.

```bash
node -v 
npm -v 
```

## Setup

```bash
git clone https://github.com/wso2/devrel.git

git checkout Kubecon-demos

cd kfone-website
```

##### Let's setup the environment variables.

Get a copy of the `.env.example` file and rename it as `.env`. Then change the below values, as per the description provided in each .env variable.

```bash
NODE_ENV=development
HTTPS=true
PORT=3001
REACT_APP_ASGARDEO_CLIENT_ID=<CLIENT ID OF THE OIDC APPLICATION REGISTERED IN ASGARDEO>
REACT_APP_ASGARDEO_BASE_URL=<BASE URL OF THE ASGARDEO API ENDPOINT (Eg. https://api.asgardeo.io/t/kfone)>
REACT_APP_CHOREO_CLIENT_ID=<CONSUMER ID OF THE APPLICATION REGISTERED IN CHOREO>
REACT_APP_BASE_API_ENDPOINT=<BASE URL OF CHOREO HOSTED API>
REACT_APP_CHOREO_ORGANIZATION=<ORGANIZATION OF CHOREO HOSTED API>
REACT_APP_CHOREO_AUTH_TOKEN=<CHOREO AUTH TOKEN TO GET ACCESS TOKEN>
REACT_APP_MY_ACCOUNT_URL=<MY ACCOUNT APP URL (Eg. https://myaccount.asgardeo.io/t/kfone)>
```

## Install Dependencies

From the project root, install dependencies using the below command.

```bash
npm install
```

## Run Application


```bash
npm start
```

The application should be up and running in port 3001 🎉
