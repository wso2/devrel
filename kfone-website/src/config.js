/* eslint-disable no-undef */
const CONFIG = {
  clientID: process.env.REACT_APP_ASGARDEO_CLIENT_ID,
  baseUrl: process.env.REACT_APP_ASGARDEO_BASE_URL,
  signInRedirectURL: 'https://localhost:3001/my-kfone',
  signOutRedirectURL: 'https://localhost:3001',
  scope: ['openid', 'profile', 'email'],
  stsConfig: {
    client_id: process.env.REACT_APP_CHOREO_CLIENT_ID,
    orgHandle: process.env.REACT_APP_CHOREO_ORGANIZATION,
    scope: [
      'apim:api_manage',
      'apim:subscription_manage',
      'apim:tier_manage',
      'apim:admin',
      'apim:publisher_settings',
      'environments:view_prod',
      'environments:view_dev',
      'apim:api_generate_key'
    ]
  },
  stsTokenEndpoint: 'https://sts.choreo.dev/oauth2/token',
  resourceServerURLs: process.env.REACT_APP_BASE_API_ENDPOINT
};

export default CONFIG;
