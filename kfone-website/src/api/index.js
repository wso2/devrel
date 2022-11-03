const BASE_URL =
  'https://42807e1f-07ba-4fb0-a6d2-ecc7b41dd143-prod.e1-us-east-azure.choreoapis.dev';

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
