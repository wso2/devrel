import axios from 'axios';

// eslint-disable-next-line no-undef
const BASE_URL = process.env.REACT_APP_BASE_API_ENDPOINT;

export async function initiatePhoneVerify(email, mobile, httpRequest) {
  const requestConfig = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/scim+json'
    },
    method: 'POST',
    data: {
      email: email,
      mobile: mobile
    },
    url: `${BASE_URL}/yphf/user-registration/1.0.0/initiate`
  };

  return httpRequest(requestConfig)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
}

export async function verifyPhone(email, mobile, httpRequest) {
  const requestConfig = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/scim+json'
    },
    method: 'POST',
    data: {
      email: email,
      mobile: mobile
    },
    url: `${BASE_URL}/yphf/user-registration/1.0.0/verify`
  };

  return httpRequest(requestConfig)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error(error);
    });
}

export async function getUsageData(userId, httpRequest) {
  const requestConfig = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/scim+json'
    },
    method: 'GET',
    url: `${BASE_URL}/yphf/usage-data-api/1.0.0/getUsageData?userId=${userId}`
  };

  return httpRequest(requestConfig);
}

export const recordUserInteractions = (email, interactions, httpRequest) => {
  const { smartPhoneVisits, iotDevicesVisits, mobileSubscriptionVisits, tvSubscriptionVisits } =
    interactions;

  const requestConfig = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    data: {
      email: email,
      smartPhoneVisits: smartPhoneVisits ?? 0,
      iotDevicesVisits: iotDevicesVisits ?? 0,
      mobileSubscriptionVisits: mobileSubscriptionVisits ?? 0,
      tvSubscriptionVisits: tvSubscriptionVisits ?? 0
    },
    url: `${BASE_URL}/yphf/user-interactions-api/1.0.0/interactions`
  };

  return httpRequest(requestConfig);
};

export const getPackageRecommendation = (userId, httpRequest) => {
  const requestConfig = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'GET',
    params: {
      userId: userId
    },
    url: `${BASE_URL}/yphf/usage-data-api/1.0.0/packageRecommendation`
  };

  return httpRequest(requestConfig)
    .then((response) => {
      if (response?.data?.status !== 'Recommendation Found') {
        throw 'Recommendation Not Found';
      }

      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

export const getAccessToken = () =>
  axios.post(
    'https://sts.choreo.dev/oauth2/token',
    {
      grant_type: 'client_credentials'
    },
    {
      headers: {
        // eslint-disable-next-line no-undef
        Authorization: `Basic ${process.env.REACT_APP_CHOREO_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
