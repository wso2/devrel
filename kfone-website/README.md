# Kfone website

Website of the Kfone demo telecommunication company.

## Prerequisites

Install Node.JS LTS from https://nodejs.org/en/download/

Verify if you have the LTS version installed.

```bash
node -v # should be something like v16.x
npm -v # should be something like v8.x
```

## Setup

```bash
git clone https://github.com/chaminjay/kfone-website

cd kfone-website
```

Go to src/config.json and change the `signInRedirectURL` and `signOutRedirectURL` as below, to run the application locally.

```json
"signInRedirectURL": "https://localhost:3001/my-kfone",
"signOutRedirectURL": "https://localhost:3001",
```

## Install Dependencies

From the project root, install dependencies using the below command.

```bash
npm install
```

## Bootstrap Application


```bash
npm start
```

The application should be up and running in port 3001 🎉
