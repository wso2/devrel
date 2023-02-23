
// White Paper Download API

import ballerinax/hubspot.crm.contact;
import ballerina/log;
import ballerina/http;
import ballerinax/googleapis.gmail;
import ballerina/regex;
import ballerina/io;

configurable string hubspotClientId = ?;
configurable string hubspotClientSecret = ?;
configurable string hubspotRefreshToken = ?;
configurable string googleClientId = ?;
configurable string googleClientSecret = ?;
configurable string googleRefreshToken = ?;

const string SOFTWARE = "software";
const string EMAIL_TEMPLATE_FILE_PATH = "resources/webinar-email-template.html";

type Lead readonly & record {
    string email;
    boolean isWebinarAlert;
};

service / on new http:Listener(9090) {

    resource function post whitePaperDownload(@http:Payload Lead lead) returns error? {

        // Create a lead contact in hubspot if not exists.
        contact:Client hubspotEndpoint = check new ({
            auth: {
               refreshUrl: "https://api.hubapi.com/oauth/v1/token",
               refreshToken: hubspotRefreshToken,
               clientId: hubspotClientId,
               clientSecret: hubspotClientSecret,
               credentialBearer: "POST_BODY_BEARER"
            }
        });

        contact:PublicObjectSearchRequest searchContact = getHubspotContactSearchPayload(lead.email);
        
        contact:CollectionResponseWithTotalSimplePublicObjectForwardPaging search = check hubspotEndpoint->search(searchContact);
        log:printInfo(string`### No. of Hubspot search results for the email: ${lead.email} - ${search.total}`);

        if search.total == 1 {
            contact:SimplePublicObject[] contacts = search.results;
            string contactID = contacts[0].id;
            string newLifeCycleStatus = check getLifeCycleStage(contacts);

            string noOfDownloads = check contacts[0].properties["no_whitepaper_downloads"].ensureType();

            int newNoOfDownloads;
            if noOfDownloads == "" {
                newNoOfDownloads = 1;
            } else {
                newNoOfDownloads = check int:fromString(noOfDownloads) + 1;
            }
            log:printInfo(string`### Hubspot whitepaper downloads: ${newNoOfDownloads}`);
            
            string interestedProductsStr = (check contacts[0].properties.toJson().interested_products).toString();
            string[] interestedProducts = regex:split(interestedProductsStr, ",");
            if interestedProducts.indexOf(SOFTWARE) == () {
                interestedProductsStr = interestedProductsStr + "," + SOFTWARE;
            }
            
            // Update contact.
            contact:SimplePublicObjectInput updatePayload = {
                "properties": {
                    "lifecyclestage" : newLifeCycleStatus,
                    "no_whitepaper_downloads" : newNoOfDownloads,
                    "interested_products" : interestedProductsStr
                }
            };
            contact:SimplePublicObject _ = check hubspotEndpoint->update(contactID, updatePayload);
            log:printInfo(string`### Hubspot contact updated for: ${lead.email}`);
            
        } else {
            // Create hubspot contact.
            contact:SimplePublicObjectInput contactPayload =
                {
                "properties": {
                    "email": lead.email,
                    "lifecyclestage" : "lead",
                    "no_whitepaper_downloads" : 1,
                    "interested_products" : SOFTWARE
                }
            };
            contact:SimplePublicObject createResponse = check hubspotEndpoint->create(contactPayload);
            log:printInfo(string`### New HubSpot contact created for email: ${lead.email}. Contact ID: ${createResponse.id}`);
        }

        // Send webinar registration email
        if lead.isWebinarAlert {

            gmail:ConnectionConfig gmailConfig = {
                auth: {
                    refreshUrl: gmail:REFRESH_URL,
                    refreshToken: googleRefreshToken,
                    clientId: googleClientId,
                    clientSecret: googleClientSecret
                }
            };

            string url = string`http://localhost:8080/ciam-2.0-poc-website/webinar.html?ref=${lead.email.toBytes().toBase64()}`;

            string rawEmailTemplate = check io:fileReadString(EMAIL_TEMPLATE_FILE_PATH);
            string emailTemplate = regex:replaceAll(rawEmailTemplate, "<URL>", url);

            gmail:Client gmailClient = check new (gmailConfig);
            string userId = "me";
            gmail:MessageRequest messageRequest = {
                recipient: lead.email,
                subject: "Grow with KFone - Live webinar series",
                messageBody: emailTemplate,
                contentType: gmail:TEXT_HTML,
                sender: "KFone Marketing<marketing.kfone@gmail.com>"
            };
            gmail:Message _ = check gmailClient->sendMessage(messageRequest, userId = userId);
            log:printInfo("### Email sent successfully");
        }
    }
}

function getLifeCycleStage(contact:SimplePublicObject[] contacts) returns string|error {
    
    string currentLifeCycleStage = check contacts[0].properties["lifecyclestage"].ensureType();
    log:printInfo(string`### Hubspot current life cycle stage: ${currentLifeCycleStage}`);

    if currentLifeCycleStage == "" || currentLifeCycleStage == "lead" {
        return "lead";
    } else {
        return currentLifeCycleStage;
    }
}

function getHubspotContactSearchPayload(string leadEmail) returns contact:PublicObjectSearchRequest {

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
               "no_whitepaper_downloads",
               "interested_products"
           ],
           "limit": 1,
           "after": 0
        };
}
