
// KFone Customer 360 API

import ballerina/http;
import ballerina/log;
import ballerina/url;

configurable string AsgardeoClientID = ?;
configurable string AsgardeoClientSecret = ?;
configurable string AsgardeoOrganization = "kfone";
configurable string ChoreoClientID = ?;
configurable string ChoreoClientSecret = ?;
configurable string ChoreoOrgHandler = "asgardeodemo";
configurable string ChoreoSTSBasePath = "https://sts.choreo.dev";
configurable string UsageDataAPIPath = "https://42807e1f-07ba-4fb0-a6d2-ecc7b41dd143-prod.e1-us-east-azure.choreoapis.dev/yphf/usage-data-api/1.0.0/getUsageData";

const string asgardeoBaseUrl = "https://api.asgardeo.io/t/";
const string scimEndpoint = "/scim2/Users";
const string tokenEndpoint = "/oauth2/token";
configurable boolean isDebugEnabled = false;
configurable string dummyUserId = "8a72d1cf-5522-4fc0-871b-d6e0fd835ba7";

type CustomerData record {
    json personalDetails;
    json subscriptionUsage;
    json billingData;
    json connectionStatus;
};

type Token record {
    string access_token;
    string scope;
    string token_type;
    int expires_in;
};

service / on new http:Listener(9090) {

    # Returns all available information of the customer.
    # + mobile - Mobile number of the customer
    # + return - JSON customer data object
    resource function get customer(string mobile) returns CustomerData|error|http:NotFound {

        // Get personal details from Asgardeo
        json personalDetails = check getAsgardeoAccountByMobile(mobile);
        if (personalDetails.errorCode == 404) {
            http:NotFound nf = {};
            return nf;
        } else {
            string userId = check personalDetails.id; 
            json billingData = check getBillingData(userId);
            json connectionStatus = check getConnectionStatus(userId);
            json usageData = check getUsageData(userId);

            return {
                personalDetails: personalDetails,
                subscriptionUsage: usageData,
                billingData: billingData,
                connectionStatus: connectionStatus
            };
        }
    }
}

// Retrive user details from Asgardeo based on the mobile number.
isolated function getAsgardeoAccountByMobile(string mobile) returns json|error {

    string asgardeoBaseUrlWithOrg = asgardeoBaseUrl + "/" + AsgardeoOrganization;
    string asgardeoTokenUrl = asgardeoBaseUrlWithOrg + tokenEndpoint;

    http:Client AsgardeoClient = check new (asgardeoBaseUrlWithOrg,
        auth = {
            tokenUrl: asgardeoTokenUrl,
            clientId: AsgardeoClientID,
            clientSecret: AsgardeoClientSecret,
            scopes: ["internal_user_mgt_view internal_user_mgt_list"]
        }
    );

    string path = scimEndpoint + "?filter=phoneNumbers.mobile+co+" + mobile;
    http:Response response = check AsgardeoClient->get(path);

    match response.statusCode {
        http:STATUS_OK => {
            json asgardeoResponse = check response.getJsonPayload();
            if (isDebugEnabled) {
                log:printInfo(string`### DEBUG - Asgardeo repsonse for mobile: ${mobile} - ${asgardeoResponse.toString()}`);
            }

            if (asgardeoResponse.totalResults == 1) {
                json[] resources = check asgardeoResponse.Resources.ensureType();
                return resources[0];
            } else {
                log:printInfo(string`### INFO - Asgardeo user not found for the mobile: ${mobile}`);
                return {
                    errorCode: 404
                };
            }
        }
        http:STATUS_NOT_FOUND => {
            log:printInfo(string`### INFO - Asgardeo user not found for the mobile: ${mobile}`);
            return {
                errorCode: 404
            };
        }
        _ => {
            log:printInfo(string`### INFO - Asgardeo user retrival error - ${check response.getTextPayload()}`);
            return {};
        }
    }
}

isolated function getBillingData(string userId) returns json|error {

    json billingData = {
        currentBillingCycle: {
            year: 2022,
            month: "October",
            amount: 300.00,
            due: "25.10.2022",
            status: "PENDING"
        },
        pastBillingCycles: [
            {
                year: 2022,
                month: "June",
                amount: 125.00,
                due: "25.06.2022",
                status: "PAID"
            },
            {
                year: 2022,
                month: "July",
                amount: 132.00,
                due: "25.07.2022",
                status: "PAID"
            },
            {
                year: 2022,
                month: "August",
                amount: 120.00,
                due: "25.08.2022",
                status: "PENDING"
            },
            {
                year: 2022,
                month: "September",
                amount: 250.00,
                due: "25.09.2022",
                status: "PENDING"
            }
        ]
    };

    return billingData;
}

isolated function getConnectionStatus(string userId) returns json|error {

    // Hard code connection status
    if (userId == dummyUserId) {
        return {
            status: "De-activated",
            reason: "Credit limit exceeded"
        };
    }

    return {
        status: "Active"
    };
}

isolated function getUsageData(string userId) returns json|error {

    final http:Client choreoAPIClient = check new (UsageDataAPIPath);
    string accessToken = string `Bearer ${(check getAccessToken())}`;
    string url = string`?userId=${userId}`;
    http:Response resp = check choreoAPIClient->get(url, {"Authorization":accessToken, "x-console-version":"v2"});

    match resp.statusCode {
        http:STATUS_OK => {
            return resp.getJsonPayload();
        }
        _ => {
            log:printInfo(string`### ERROR - Usage data retrival error for the user: ${userId} - Error code: ${resp.statusCode}`);
            return {};  
        }
    }
}

isolated function getAccessToken() returns string|error {

    final http:Client stsClient = check new (ChoreoSTSBasePath);
    http:Response resp = check stsClient->post("/oauth2/token", check constructGetAuthTokenRequest());
    match resp.statusCode {
        http:STATUS_OK => {
            Token token = check getTokenInfo(check getJsonPayload(resp.getJsonPayload()));
            if token.access_token.length() != 0 {
                return token.access_token;
            }
            return error("Bad request");
        }
        _ => {
            return error("Bad request");  
        }
    }
}

isolated function constructGetAuthTokenRequest() returns http:Request|error {
    
    http:Request req = new;
    string scopes = "apim:api_manage apim:subscription_manage apim:tier_manage apim:admin apim:publisher_settings environments:view_prod environments:view_dev apim:api_generate_key";
    req.setTextPayload(string `grant_type=client_credentials&scope=${check url:encode(scopes, "UTF-8")}&orgHandle=${ChoreoOrgHandler}`);
    req.setHeader("Content-type", "application/x-www-form-urlencoded");
    req.setHeader("Authorization", getAuthToken());
    return req;
}

isolated function getAuthToken() returns string {

    string clientCredentials = string `${ChoreoClientID}:${ChoreoClientSecret}`;
    return string `Basic ${clientCredentials.toBytes().toBase64()}`;
}

isolated function getJsonPayload(json|http:ClientError jsonPayload) returns json|error {

    if jsonPayload is json {
        return jsonPayload;
    } else {
        return error("error occured while retriving json payload");
    }
}

isolated function getTokenInfo(json jsonPayload) returns Token|error {

    Token|error resp = jsonPayload.cloneWithType(Token);
    if resp is error {
        return error(string `${resp.message()}, error occured while converting payload to Token`);
    } else {
        return resp;
    }
}
