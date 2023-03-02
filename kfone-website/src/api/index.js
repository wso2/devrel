/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

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
    url: `${BASE_URL}/account-verification-api/1.0.0/initiate`
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
    url: `${BASE_URL}/account-verification-api/1.0.0/verify`
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
    url: `${BASE_URL}/usage-data-api/1.0.0/getUsageData?userId=${userId}`
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
