const authConfig = {
  signInRedirectURL: process.env.REACT_APP_ASGARDEO_CALLBACK_URL ?? "",
  signOutRedirectURL: process.env.REACT_APP_ASGARDEO_CALLBACK_URL ?? "",
  clientID: process.env.REACT_APP_ASGARDEO_CLIENT_ID ?? "",
  baseUrl: process.env.REACT_APP_ASGARDEO_BASE_URL ?? "",
  scope: ["openid", "profile"],
  disableTrySignInSilently: false,
  stsConfig: {
    client_id: process.env.REACT_APP_CHOREO_CLIENT_ID,
    scope: [
      "apim:api_manage",
      "apim:subscription_manage",
      "apim:tier_manage",
      "apim:admin",
      "apim:publisher_settings",
      "environments:view_prod",
      "environments:view_dev",
      "apim:api_generate_key",
    ],
    orgHandle: process.env.REACT_APP_CHOREO_ORGANIZATION,
  },
  stsTokenEndpoint: process.env.REACT_APP_CHOREO_TOKEN_ENDPOINT,
  resourceServerURLs: process.env.REACT_APP_BASE_API_ENDPOINT,
};

export default authConfig;
