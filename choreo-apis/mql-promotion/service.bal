import ballerinax/slack;
import ballerina/http;
import ballerina/log;
import ballerinax/googleapis.gmail;
import ballerinax/salesforce;
import ballerina/regex;
import ballerina/io;

configurable string slackToken = ?;
configurable string channelName = "general";
configurable string SFRefreshToken = ?;
configurable string SFClientSecret = ?;
configurable string SFClientId = ?;
configurable string googleRefreshToken = ?;
configurable string googleClientSecret = ?;
configurable string googleClientId = ?;

const string EMAIL_TEMPLATE_FILE_PATH = "resources/new-opp-email-template.html";

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

type AM readonly & record {
    string name;
    string sfId;
    string email;
};

service / on new http:Listener(9090) {

    resource function post promoteMQL(@http:Payload Lead lead) returns error? {   

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

        // Create Lead in Salesforce.
        salesforce:Client salesforceEndpoint = check new (
            {
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
            log:printInfo(string`### Lead ${lead.Email} already exists in salesforce`);
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

        string kycURL = string`http://localhost:8080/ciam-2.0-poc-c360-dashboard/home.jsp?ref=${lead.Email.toBytes().toBase64()}`;

        // Post a message to slack channel.
        slack:Client slackEndpoint = check new ({auth: {token: slackToken}});
        slack:Message mesage = {
            channelName: channelName, 
            text: string`*New Opportunity Identified*\n\n` + 
            string`User ${lead.Email} has been identified as a new opportunity and ${am.email} assigned as the account manager.\n` + 
            string`Please use this <${kycURL}|link> to check customer details.`
        };
        string _ = check slackEndpoint->postMessage(mesage);
        log:printInfo(string`### Slack message posted successfully for lead: ${lead.Email}`);

        // Send an email to defined receipient.
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
        log:printInfo(string`### Email sent successfully for lead: ${lead.Email}`);
    }
}
