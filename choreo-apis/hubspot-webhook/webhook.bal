
// Hubspot webhook

import ballerinax/trigger.hubspot;
import ballerina/http;
import ballerinax/hubspot.crm.contact;
import ballerina/log;
import ballerinax/slack;
import ballerinax/googleapis.gmail;
import ballerinax/salesforce;
import ballerina/regex;
import ballerina/io;

configurable hubspot:ListenerConfig hubspotConfig = ?;
configurable string hubspotClientId = ?;
configurable string hubspotRefreshToken = ?;
configurable string slackToken = ?;
configurable string channelName = "general";
configurable string SFClientId = ?;
configurable string SFClientSecret = ?;
configurable string SFRefreshToken = ?;
configurable string googleClientId = ?;
configurable string googleClientSecret = ?;
configurable string googleRefreshToken = ?;

const string EMAIL_TEMPLATE_FILE_PATH = "resources/new-opp-email-template.html";
const string HUBSPOT_REFRESH_URL = "https://api.hubapi.com/oauth/v1/token";
const int HUBSPOT_SCORE_THRESHOLD = 5;

type Lead readonly & record {
    string LeadSource;
    string FirstName;
    string LastName;
    string Email;
    string Website;
    string Company;
};

type SFLead readonly & record {
    string LeadSource;
    string FirstName;
    string LastName;
    string Email;
    string Website;
    string Company;
    string OwnerId;
};

type HubSpotContact readonly & record {
    string firstname;
    string lastname;
    string email;
    string no_whitepaper_downloads;
    string no_webinar_registrations;
    string company;
};

type AM readonly & record {
    string name;
    string sfId;
    string email;
};

final contact:Client hubspotEndpoint = check new ({
    auth: {
        refreshUrl: HUBSPOT_REFRESH_URL,
        refreshToken: hubspotRefreshToken,
        clientId: hubspotClientId,
        clientSecret: hubspotConfig.clientSecret,
        credentialBearer: "POST_BODY_BEARER"
    }
});

listener http:Listener httpListener = new (8090);
listener hubspot:Listener webhookListener = new (hubspotConfig, httpListener);

service hubspot:ContactService on webhookListener {

    remote function onContactCreation(hubspot:WebhookEvent event) returns error? {
        //Not Implemented
    }
    remote function onContactDeletion(hubspot:WebhookEvent event) returns error? {
        //Not Implemented
    }
    remote function onContactPropertychange(hubspot:WebhookEvent event) returns error? {

        if (event?.propertyName == "hubspotscore" && event.propertyValue != ()) {
            string eventId = (<int>event.eventId).toString();
            log:printInfo(string `### Hubspot score changed. Event ID: ${eventId}`);

            int hubspotScore = check int:fromString(event.propertyValue ?: "0");

            if (hubspotScore > HUBSPOT_SCORE_THRESHOLD) {
                log:printInfo(string `### Processing event. Id: ${eventId}`);

                string contactId = (<int>event.objectId).toString();
                check updateLifeCycleStageOnHubSpot(hubspotEndpoint, contactId);
                HubSpotContact contactDetails = check getContactDetailsFromHubSpot(hubspotEndpoint, contactId);
                Lead lead = check createLeadFromHubSpotContact(contactDetails);
                check promoteMQL(lead);

                log:printInfo("### Event processing completed. ");
            } else {
                log:printInfo(string `### Skipped processing event. Reason: HubSpot score: ${hubspotScore} Threshold: ${HUBSPOT_SCORE_THRESHOLD}`);
            }
        }
    }
}

service /ignore on httpListener {
}

function createLeadFromHubSpotContact(HubSpotContact contact) returns Lead|error {
    string leadSource = "";
    int whitepaperDownloadsCount = check int:fromString(contact.no_whitepaper_downloads);
    int webinarRegistrationCount = check int:fromString(contact.no_webinar_registrations);

    if (whitepaperDownloadsCount > 0 && webinarRegistrationCount > 0) {
        leadSource = "White Paper Download and Webinar Registration";
    } else if (whitepaperDownloadsCount > 0) {
        leadSource = "White Paper Download";
    } else if (webinarRegistrationCount > 0) {
        leadSource = "Webinar Registration";
    }
    return {
        LeadSource: leadSource,
        FirstName: contact.firstname,
        LastName: contact.lastname,
        Email: contact.email,
        Website: "Asgardeo",
        Company: contact.company
    };
}

function getContactDetailsFromHubSpot(contact:Client hubspotEndpoint, string contactId) returns HubSpotContact|error {
    log:printInfo(string `### Requesting HubSpot contact details for the contact id: ${contactId}`);

    contact:SimplePublicObjectWithAssociations hubspotContact = check hubspotEndpoint->getObjectById(
        contactId, properties = ["firstname", "lastname", "email", "no_webinar_registrations", "no_whitepaper_downloads", "company"]
    );

    log:printInfo(string `### HubSpot contact details recieved for the contact id: ${contactId}`);
    return hubspotContact.properties.cloneWithType(HubSpotContact);
}

function updateLifeCycleStageOnHubSpot(contact:Client hubspotEndpoint, string contactId) returns error? {
    log:printInfo(string `### Updating lifecycle stage for contact id: ${contactId}`);

    contact:SimplePublicObject _ = check hubspotEndpoint->update(contactId, {properties: {"lifecyclestage": "opportunity"}});

    log:printInfo(string `### Lifecycle stage updated for contact id: ${contactId}`);
}

function promoteMQL(Lead lead) returns error? {

    // Temp: AM data
    // AM am = {
    //     name: "Vihanga Liyanage",
    //     sfId: "0058d0000025cNbAAI",
    //     email: "vihanga@wso2.com"
    // };
    AM am = {
        name: "Nipun Sampath",
        sfId: "0058d0000025cNbAAI",
        email: "nipunsam@wso2.com"
    };

    check createLeadInSalesForce(lead, am);

    final string kycURL = string `http://localhost:8080/ciam-2.0-poc-c360-dashboard/home.jsp?ref=${lead.Email.toBytes().toBase64()}`;

    check postMessageOnSlackChannel(lead, am, kycURL);
    check sendEmailToRecipient(lead, am, kycURL);
}

function createLeadInSalesForce(Lead lead, AM am) returns error? {
    salesforce:Client salesforceEndpoint = check new ({
        baseUrl: "https://wso2-2d-dev-ed.my.salesforce.com",
        clientConfig:
                    {
            refreshUrl: "https://wso2-2d-dev-ed.my.salesforce.com/services/oauth2/token",
            refreshToken: SFRefreshToken,
            clientId: SFClientId,
            clientSecret: SFClientSecret
        }
    }
        );
    string leadGetQuery = "SELECT Id FROM Lead WHERE Email='" + lead.Email + "'";
    salesforce:SoqlResult queryResult = check salesforceEndpoint->getQueryResult(leadGetQuery);
    if queryResult.totalSize > 0 {
        log:printInfo(string `### Lead ${lead.Email} already exists in salesforce`);
    } else {
        // Create saleforce Lead.
        SFLead sfLead = {
            LeadSource: lead.LeadSource,
            FirstName: lead.FirstName,
            LastName: lead.LastName,
            Email: lead.Email,
            Website: lead.Website,
            Company: lead.Company,
            OwnerId: am.sfId
        };
        string createLeadResponse = check salesforceEndpoint->createLead(sfLead.toJson());
        log:printInfo(createLeadResponse);
    }
}

function postMessageOnSlackChannel(Lead lead, AM am, string kycURL) returns error? {
    slack:Client slackEndpoint = check new ({auth: {token: slackToken}});
    slack:Message mesage = {
        channelName: channelName,
        text: "*New Opportunity Identified* \n\n" +
            string `User ${lead.Email} has been identified as a new opportunity and ${am.email} assigned as the account manager.`+ "\n" +
            string `Please use this <${kycURL}|link> to check customer details.`
    };
    string _ = check slackEndpoint->postMessage(mesage);
    log:printInfo(string `### Slack message posted successfully for lead: ${lead.Email}`);
}

function sendEmailToRecipient(Lead lead, AM am, string kycURL) returns error? {
    gmail:ConnectionConfig gmailConfig = {
        auth: {
            refreshUrl: gmail:REFRESH_URL,
            refreshToken: googleRefreshToken,
            clientId: googleClientId,
            clientSecret: googleClientSecret
        }
    };

    string emailTemplate = check io:fileReadString(EMAIL_TEMPLATE_FILE_PATH);

    emailTemplate = regex:replaceAll(emailTemplate, "<KYC_URL>", kycURL);
    emailTemplate = regex:replaceAll(emailTemplate, "<AM_NAME>", am.name);
    emailTemplate = regex:replaceAll(emailTemplate, "<LEAD_EMAIL>", lead.Email);

    gmail:Client gmailClient = check new (gmailConfig);
    string userId = "me";
    gmail:MessageRequest messageRequest = {
        recipient: am.email,
        subject: "New Opportunity Identified - " + lead.Email,
        messageBody: emailTemplate,
        contentType: gmail:TEXT_HTML,
        sender: "Fleet Inc <contact.fleetinc@gmail.com>"
    };
    gmail:Message _ = check gmailClient->sendMessage(messageRequest, userId = userId);
    log:printInfo(string `### Email sent successfully for lead: ${lead.Email}`);
}
