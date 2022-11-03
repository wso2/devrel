export type PastBillingCycle = {
  year: number;
  month: string;
  amount: number;
  due: string;
  status: string;
}

export type UserInfo = {
  personalDetails: {
    emails: string[];
    meta: {
      created: string;
      location: string;
      lastModified: string;
      resourceType: string;
    };
    roles: {
      display: string;
      value: string;
      $ref: string;
    }[];
    name: {
      givenName: string;
      familyName: string;
    };
    id: string;
    userName: string;
    "urn:scim:wso2:schema": {
      country: string;
      preferredChannel: string;
      userSource: string;
      mobileNumberVerified: string;
      idpType: string;
      dateOfBirth: string;
      userAccountType: string;
    };
    phoneNumbers: [
      {
        type: string;
        value: string;
      }
    ];
  };
  subscriptionUsage: {
    userId: string;
    callMinutesUsed: number;
    mobileDataUsed: number;
    subscription: {
      id: number;
      connectionType: string;
      freeCallMinutes: number;
      freeDataGB: number;
    };
    usage: [
      {
        month: number;
        year: number;
        allocatedMinutesUsage: number;
        allocatedDataUsage: number;
        additionalPurchases: [
          {
            additionalData: number;
            additionalMinutes: number;
          }
        ];
      }
    ];
  };
  billingData: {
    currentBillingCycle: {
      year: number;
      month: string;
      amount: number;
      due: string;
      status: string;
    };
    pastBillingCycles: PastBillingCycle[];
  };
  connectionStatus: {
    status: string;
    reason?: string;
  };
};
