// Insurance Pricing Download

import ballerinax/hubspot.crm.contact;
import ballerina/log;
import ballerina/http;
import ballerinax/googleapis.gmail;
import ballerinax/slack;
import ballerinax/salesforce as sfdc;
import ballerina/regex;
import ballerina/io;

configurable string hubspotRefreshToken = ?;
configurable string hubspotClientID = ?;
configurable string hubspotClientSecret = ?;
configurable string googleRefreshToken = ?;
configurable string googleClientID = ?;
configurable string googleClientSecret = ?;
configurable string slackToken = ?;
configurable string channelName = "general";
configurable string SFRefreshToken = ?;
configurable string SFClientID = ?;
configurable string SFClientSecret = ?;

const string INSURANCE = "insurance";
const string EMAIL_TEMPLATE_FILE_PATH = "resources/upsell-email-template.html";

type Lead readonly & record {
    string email;
};

type AccountManager record {
    string name;
    string email;
};


// Insurance Pricing Download API
service / on new http:Listener(9090) {

    resource function post trackDownloads(@http:Payload Lead lead) returns error? {

        // Check whether the lead contact is in hubspot.
        contact:Client hubspotEndpoint = check new ({
            auth: {
               refreshUrl: "https://api.hubapi.com/oauth/v1/token",
               refreshToken: hubspotRefreshToken,
               clientId: hubspotClientID,
               clientSecret: hubspotClientSecret,
               credentialBearer: "POST_BODY_BEARER"
            }
        });
        contact:PublicObjectSearchRequest searchContact = getHubspotSearchPayload(lead.email);
        
        contact:CollectionResponseWithTotalSimplePublicObjectForwardPaging search = check hubspotEndpoint->search(searchContact);
        log:printInfo(string`### Hubspot search result for the email: ${lead.email} is: ${search.toString()}`);
        if search.total == 1 {
            contact:SimplePublicObject[] contacts = search.results;
            string contactID = contacts[0].id;
            string lifecycleStage = check contacts[0].properties["lifecyclestage"].ensureType();
            string company = check contacts[0].properties["company"].ensureType();
            string interestedProductsStr = check contacts[0].properties["interested_products"].ensureType();

            log:printInfo(string`### Hubspot properties lifecycleStage: ${lifecycleStage}, company: ${company}, interestedProducts: ${interestedProductsStr}`);

            if lifecycleStage == "customer" {
                log:printInfo(string`### Upsell opp detected for the user: ${lead.email}`);

                string[] interestedProducts = regex:split(interestedProductsStr, ",");
                if interestedProducts.indexOf(INSURANCE) == () {
                    // Update contact.
                    contact:SimplePublicObjectInput updatePayload = {
                        "properties": {
                            "interested_products" : interestedProductsStr + "," + INSURANCE
                        }
                    };
                    contact:SimplePublicObject _ = check hubspotEndpoint->update(contactID, updatePayload);
                    log:printInfo(string`###  Updated hubspot account with new interest: ${INSURANCE} for customer: ${lead.email}`);
                }
                
                AccountManager am = check getAMFromSalesforce(lead.email);
                if am.email != "" {

                    string kycURL = string`http://localhost:8080/ciam-2.0-poc-c360-dashboard/home.jsp?ref=${lead.email.toBytes().toBase64()}`;

                     // Post a message to slack channel.
                    slack:Client slackEndpoint = check new ({auth: {token: slackToken}});
                    slack:Message mesage = {
                        channelName: channelName, 
                        text: string`*Upsell Opportunity*\n\n` +
                            string`Upsell oppertunity identified for ${lead.email} of _${company}_\n` +
                            string`${am.email}, please use this <${kycURL}|link> to check customer details.`
                        };
                    string _ = check slackEndpoint->postMessage(mesage);

                    // Send email to AM
                    error? sendEmailResult = sendEmail(lead, am, kycURL);
                    if sendEmailResult is error {
                        log:printInfo(string`###  Error while sending the email to: ${am.email} - ${sendEmailResult.toString()}`);
                    }
                }
            }
        } 
    }
}

function getHubspotSearchPayload(string leadEmail) returns contact:PublicObjectSearchRequest {

    return {
        "filterGroups": [
            {
                "filters": [
                    {
                        "value": leadEmail,
                        "propertyName": "email",
                        "operator": "EQ"
                    }
                ]
            }
        ],
        "sorts": [
            "id"
        ],
        "query": "",
        "properties": [
            "lifecyclestage",
            "company",
            "interested_products"
        ],
        "limit": 1,
        "after": 0
    };
}

function getAMFromSalesforce(string customerEmail) returns AccountManager|error {

    // Get lead data from Salesforce.
    AccountManager am = {
        name: "",
        email: ""
    };
    
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

    string leadGetQuery = string`SELECT Id FROM Lead WHERE Email='${customerEmail}'`;
    sfdc:SoqlResult getQueryResultResponse = check salesforceEndpoint->getQueryResult(leadGetQuery);

    if getQueryResultResponse.totalSize == 1 {
        json[] leads = <json[]> getQueryResultResponse.records.toJson();
        string leadID = check leads[0].Id;
        json getLeadByIdResponse = check salesforceEndpoint->getLeadById(leadID);
        
        log:printInfo(string`###  Salesforce contact details for the customer: ${customerEmail} - ${getLeadByIdResponse.toString()}`);
        
        string amId = check getLeadByIdResponse.OwnerId;
        string getAMEmailQuery = string`SELECT name, email FROM User WHERE Id='${amId}'`;
        sfdc:SoqlResult response = check salesforceEndpoint->getQueryResult(getAMEmailQuery);
        log:printInfo(string`\n### AM record from SF: ${response.toString()}`);
        json[] jsonArray = <json[]> response.records.toJson();
        am.email = check jsonArray[0].Email;
        am.name = check jsonArray[0].Name;
    } else {
        log:printInfo(string`###  Salesforce contact coundn't be found for the customer: ${customerEmail}`);
    }

    return am;
}

function sendEmail(Lead lead, AccountManager am, string kycURL) returns error? {

    gmail:ConnectionConfig gmailConfig = {
        auth: {
            refreshUrl: gmail:REFRESH_URL,
            refreshToken: googleRefreshToken,
            clientId: googleClientID,
            clientSecret: googleClientSecret
        }
    };

    string emailTemplate = check io:fileReadString(EMAIL_TEMPLATE_FILE_PATH);
    emailTemplate = regex:replaceAll(emailTemplate, "<KYC_URL>", kycURL);
    emailTemplate = regex:replaceAll(emailTemplate, "<AM_NAME>", am.name);
    emailTemplate = regex:replaceAll(emailTemplate, "<LEAD_EMAIL>", lead.email);

    gmail:Client gmailClient = check new (gmailConfig);
    string userId = "me";
    gmail:MessageRequest messageRequest = {
        recipient: am.email,
        subject: "New Upsell Opportunity - " + lead.email,
        messageBody: emailTemplate,
        contentType: gmail:TEXT_HTML,
        sender: "Fleet Inc <contact.fleetinc@gmail.com>"
    };
    gmail:Message _ = check gmailClient->sendMessage(messageRequest, userId = userId);
    log:printInfo("Email sent successfully");
}
