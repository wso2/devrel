import ballerinax/servicenow;
import ballerinax/salesforce as sfdc;
import ballerinax/hubspot.crm.contact;
import ballerina/http;
import ballerina/log;
import ballerina/regex;

configurable string SFClientID = ?;
configurable string SFClientSecret = ?;
configurable string SFRefreshToken = ?;
configurable string hubspotClientID = ?;
configurable string hubspotClientSecret = ?;
configurable string hubspotRefreshToken = ?;
configurable string clearbitAPIKey = ?;
configurable string twitterAccessToken = ?;
configurable string serviceNowUsername = ?;
configurable string serviceNowPassword = ?;
configurable string serviceNowUrl = ?;
configurable boolean isDebugEnabled = false;

type User record {
    string lastName;
    string firstName;
    string email;
};

type CustomerAccount record {
    string accountName;
    User customerContact;
};

type ProfileData record {
    json clearbitData;
    json hubspotData;
    json salesforceData;
    json serviceNowData;
    int sentimentScore;
};

// TODO: Test commit.
service / on new http:Listener(9090) {

    resource function get customer\-360view(string email) returns ProfileData|error {
        
        json clearbitData = check getClearbitData(email);
        json twitterData = {};
        int sentimentScore = 0;
        json|error twitterID = clearbitData.person.twitter.'id;
        if twitterID is int {
            twitterData = check getTwitterData(twitterID);
            json|error tweets = twitterData.data;
            if tweets is json[] {
                sentimentScore = getSentimentScore(tweets, clearbitData);
            }
        }
        json hubspotData = check getHubspotData(email);
        json salesforceData = check getSaleforceData(email);
        json serviceNowData = check getServiceNowData(email);
        
        return {
            clearbitData: clearbitData, 
            hubspotData: hubspotData, 
            salesforceData: salesforceData, 
            serviceNowData : serviceNowData,
            sentimentScore: sentimentScore
        };
    }
}

function getClearbitData(string email) returns json|error {

    printDebugLog(string`### Retrieving clearbit data for the email: ${email}`);
    
    if email == "jl.ciam.user@gmail.com" || email == "jl.ciam.user.1@gmail.com" {
        // Hard coding response for the demo user
        return getHardCodedClearbitResponse();
    } 

    http:Client clearbitCompanyEndpoint = check new (
        "https://person.clearbit.com/v2/combined/find?email=",
        auth = {token: clearbitAPIKey}
    );
    http:Response clearbitResponse = check clearbitCompanyEndpoint->get(email);
    json clearbitResponseJSON = check clearbitResponse.getJsonPayload();
    printDebugLog(string`### Clearbit response for the email: ${email} - ${clearbitResponseJSON.toString()}`);
    return clearbitResponseJSON;
}

function getTwitterData(int twitterId) returns json|error {

    printDebugLog(string`### Retrieving twitter data for the ID: ${twitterId}`);
    http:Client twitterEndpoint = check new (
        "https://api.twitter.com/2/users",
        auth = {token: twitterAccessToken}
    );
    http:Response twitterResponse = check twitterEndpoint->get(string`/${twitterId}/tweets`);
    json twitterResponseJSON = check twitterResponse.getJsonPayload();

    printDebugLog(twitterResponseJSON.toString());
    return twitterResponseJSON;
}

function getSentimentScore(json[] tweets, json clearbitData) returns int {

    string[] sentimentAnalysisKeyWords = ["taxi", "taxis", "fleet", "vehicles", "metro"];

    int score = 0;
    foreach json tweet in tweets {
        json|error text = tweet.text;
        if text is string {
            string[] words = regex:split(text, " ");
            foreach string word in words {
                if sentimentAnalysisKeyWords.indexOf(word) != () {
                    score = score + 1;
                }
            }
        }
    }
    printDebugLog(string`### Calculated sentiment score: ${score}`);

    if score > 4 {
        return 85;
    } else if score > 3 {
        return 75;
    } else if score > 2 {
        return 50;
    } else {
        return 30;
    }
}

function getHubspotData(string email) returns json|error {

    printDebugLog(string`### Retrieving Hubspot data for the email: ${email}`);
    contact:Client contactEndpoint = check new ({
        auth: {
            refreshUrl: "https://api.hubapi.com/oauth/v1/token",
            refreshToken: hubspotRefreshToken,
            clientId: hubspotClientID,
            clientSecret: hubspotClientSecret,
            credentialBearer: "POST_BODY_BEARER"
        }
    });

    contact:CollectionResponseWithTotalSimplePublicObjectForwardPaging searchResponse = check contactEndpoint->search({
        filterGroups: [
            {
                "filters": [
                    {
                        "value": email,
                        "propertyName": "email",
                        "operator": "EQ"
                    }
                ]
            }
        ],
        sorts: ["id"],
        properties: [
            "lifecyclestage",
            "hubspotscore",
            "no_webinar_registrations",
            "no_whitepaper_downloads",
            "interested_products"
        ],
        'limit: 1,
        after: 0
    });
    if searchResponse.total == 1 {
        contact:SimplePublicObject[] contacts = searchResponse.results;
        printDebugLog(contacts[0].toString());
        return contacts[0].toJson();
    } else {
        printDebugLog(string`### Hubspot contact coundn't be found for the email: ${email}`);
        return {};
    }
}

function getSaleforceData(string email) returns json|error {

    printDebugLog(string`### Retrieving Salesforce data for the email: ${email}`);
    sfdc:Client salesforceEndpoint = check new ({
        baseUrl: "https://wso2-2d-dev-ed.my.salesforce.com",
        clientConfig: {
            refreshUrl: "https://wso2-2d-dev-ed.my.salesforce.com/services/oauth2/token",
            refreshToken: SFRefreshToken,
            clientId: SFClientID,
            clientSecret: SFClientSecret,
            credentialBearer: "POST_BODY_BEARER"
        }
    });
    string getLeadQuery = "SELECT Id FROM Lead WHERE Email='" + email + "'";
    stream<record{}, error?> getLeadQueryStream = check salesforceEndpoint->getQueryResultStream(getLeadQuery);
    
    string leadID = "";
    check from record{} r in getLeadQueryStream 
        do {
            if r["Id"] is string {
                leadID = <string> r["Id"];
            }
        };
    if leadID != "" {
        json getLeadByIdResponse = check salesforceEndpoint->getLeadById(leadID);
        printDebugLog(string`### Salesforce contact details for the email: ${email} - ${getLeadByIdResponse.toString()}`);
        return getLeadByIdResponse;
    } else {
        printDebugLog(string`### Salesforce contact coundn't be found for the email: ${email}`);
        return {};
    }
}

function getServiceNowData(string email) returns json|error {

    printDebugLog(string`### Retrieving service now data for the email: ${email}`);
    json serviceNowAccount = {};
    json[] serviceNowCases = [];
    servicenow:Client servicenowEndpoint = check new ({
        auth: {
            username: serviceNowUsername, 
            password: serviceNowPassword}
        }, serviceNowUrl);
    json|error getCustomerListResponse = servicenowEndpoint->getRecordList("customer_contact", sysparmQuery = "email="+email);
    if getCustomerListResponse is error {
        printDebugLog(string`### Error received: ${getCustomerListResponse.toString()}`);
        return {};
    }
    
    json[] customerList = check getCustomerListResponse.result.ensureType();
    if customerList.length() == 1 {
        // customer exists.
        json[] accountObjects = from var customer in customerList
                            select check customer.account;
        string customerAccount = check accountObjects[0].value;

        // Get SN account details that customer is attached to.
        json getAccountResponse = check servicenowEndpoint->getRecordById("customer_account", customerAccount);
        serviceNowAccount = getAccountResponse;
        printDebugLog(string`### Service now account: ${serviceNowAccount.toString()}`);

        json getCaseListResponse = check servicenowEndpoint->getRecordList("sn_customerservice_case", sysparmQuery = "account="+customerAccount);
        serviceNowCases = check getCaseListResponse.result.ensureType();
        printDebugLog(string`### Service now cases: ${serviceNowCases.toString()}`);
    } else {
        printDebugLog(string`### Customer doesn't exists with the email: ${email}`);
    }

    return {
        "serviceNowAccount": serviceNowAccount,
        "serviceNowCases": serviceNowCases
    };
}

function printDebugLog(string s) {

    if isDebugEnabled {
        log:printInfo(s);
    }
}

function getHardCodedClearbitResponse() returns json {

    return {
        "person": {
            "avatar": "https://raw.githubusercontent.com/chaminjay/FileCloud/main/jl-ciam-user.jpg",
            "name": {
                "fullName": "John Louise"
            },
            "email": "jl.ciam.user@gmail.com",
            "location": "US",
            "timeZone": "America/Los_Angeles",
            "site": "http://john.louise.org/",
            "employment": {
                "domain": "louiseandsons.com",
                "title": "CTO",
                "seniority": "executive"
            },
            "facebook": {
                "handle": "JohnLouise1980"
            },
            "github": {
                "handle": "JohnLouise1980"
            },
            "twitter": {
                "id": 1532324591149887490,
                "handle": "JohnLouise1980"
            },
            "linkedin": {
                "handle": "in/JohnLouise1980"
            }
        },
        "company": {
            "name": "Louise and Sons",
            "legalName": "Louise and Sons (Pvt) Ltd.",
            "logo": "https://cdn.dribbble.com/users/58851/screenshots/9560655/media/bf1593ebbdee3984ae2d31ae2d0010bb.png",
            "domain": "louiseandsons.com",
            "category": {
                "industry": "Internet Software & Services"
            },
            "facebook": {
                "handle": "louiseandsons"
            },
            "linkedin": {
                "handle": "company/louiseandsons"
            },
            "twitter": {
                "handle": "louiseandsons"
            },
            "crunchbase": {
                "handle": "organization/louiseandsons"
            },
            "metrics": {
                "employeesRange": "251-500",
                "estimatedAnnualRevenue": "$10M-$50M"
            }
        }
    };
}
