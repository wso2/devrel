import ballerinax/salesforce as sfdc;
import ballerinax/slack;
import ballerina/log;
import ballerinax/googleapis.gmail;
import ballerina/io;

// evaluation_expiry_checker

configurable string slackToken = ?;
configurable string SFRefreshToken = ?;
configurable string SFClientSecret = ?;
configurable string googleRefreshToken = ?;
configurable string googleClientSecret = ?;

configurable string channelName = "general";
configurable string serviceNowUrl = "https://dev122092.service-now.com";
configurable boolean isDebugEnabled = false;

const string AM_EMAIL_TEMPLATE_FILE_PATH = "resources/end-evaluation-am-mail-template.html";
const string LEAD_EMAIL_TEMPLATE_FILE_PATH = "resources/end-evaluation-lead-mail-template.html";

type AccountManager record {
    string name;
    string email;
};

public function main() returns error? {

    // Get lead data
    string leadEmail = "jl.ciam.user@gmail.com";
    AccountManager am = check getAMFromSalesforce(leadEmail);

    // send notifications
    boolean|error sendNotificationsResult = check sendNotifications(leadEmail, am);
    if (sendNotificationsResult is error) {
        log:printInfo("Error while sending notifications: ", sendNotificationsResult);
    }
}

function getAMFromSalesforce(string email) returns AccountManager|error {

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
            clientId: "3MVG9DREgiBqN9Wmhrg.K2YxalNsiMK9Zs4pRIaZO.ClSq_wFC4PybehiJSTlZxYv6Zf.hehvN1G7IwnHQFGk",
            clientSecret: SFClientSecret,
            credentialBearer: "POST_BODY_BEARER"
        }
    });

    string leadGetQuery = "SELECT Id FROM Lead WHERE Email='" + email + "'";
    sfdc:SoqlResult getQueryResultResponse = check salesforceEndpoint->getQueryResult(leadGetQuery);

    if (getQueryResultResponse.totalSize == 1) {
        json[] leads = <json[]>check getQueryResultResponse.records.toJson();
        string leadID = check leads[0].Id;
        json getLeadByIdResponse = check salesforceEndpoint->getLeadById(leadID);
        
        if (isDebugEnabled) {
            log:printInfo("DEBUG: Salesforce contact details for the email: " + email + " - " + getLeadByIdResponse.toString());
        }
        
        string amId = check getLeadByIdResponse.OwnerId;
        string getAMEmailQuery = "SELECT name, email FROM User WHERE Id='" + amId + "'";
        sfdc:SoqlResult response = check salesforceEndpoint->getQueryResult(getAMEmailQuery);
        if (isDebugEnabled) {
            log:printInfo("DEBUG: Salesforce AM details for the email: " + email + " - " + response.toString());
        }
        json[] jsonArray = <json[]>check response.records.toJson();
        am.email = check jsonArray[0].Email;
        am.name = check jsonArray[0].Name;
    } else {
        log:printInfo("### Salesforce contact coundn't be found for the email: " + email);
    }

    return am;
}

function sendNotifications(string leadEmail, AccountManager am) returns boolean|error {

    string kycURL = "http://localhost:8080/ciam-2.0-poc-c360-dashboard/home.jsp" + "?ref=" + leadEmail.toBytes().toBase64();

    // Post a message to slack channel.
    slack:Client slackEndpoint = check new ({auth: {token: slackToken}});
    slack:Message mesage = {channelName: channelName, text: "*End of Evaluation Period*\n\nEvaluation period ended for the lead " + leadEmail
        + "\n" + am.email + ", please use this <" + kycURL + "|link> to check customer details."};
    string slackResponse = check slackEndpoint->postMessage(mesage);
    log:printInfo("### Slack message posted successfully for customer: " + leadEmail);
    if (isDebugEnabled) {
        log:printInfo("DEBUG: Slack response: " + slackResponse.toString());
    }

    // Send an email to AM.
    gmail:ConnectionConfig gmailConfig = {
        auth: {
            refreshUrl: gmail:REFRESH_URL,
            refreshToken: googleRefreshToken,
            clientId: "1062070274080-q7s392lh5d19c61jld1d3sbsqv6669qa.apps.googleusercontent.com",
            clientSecret: googleClientSecret
        }
    };

    string amEmailTemplate = check io:fileReadString(AM_EMAIL_TEMPLATE_FILE_PATH);

    gmail:Client gmailClient = check new (gmailConfig);
    string userId = "me";
    gmail:MessageRequest amMessageRequest = {
        recipient: am.email,
        subject: "End of Evaluation Period - " + leadEmail,
        messageBody: amEmailTemplate,
        contentType: gmail:TEXT_HTML,
        sender: "Fleet Inc <contact.fleetinc@gmail.com>"
    };
    gmail:Message amGmailResponse = check gmailClient->sendMessage(amMessageRequest, userId = userId);
    log:printInfo("### Email sent successfully for AM: " + am.email);
    if (isDebugEnabled) {
        log:printInfo("DEBUG: Gmail response for AM: " + amGmailResponse.toString());
    }

    // Send email to lead
    string leadEmailTemplate = check io:fileReadString(LEAD_EMAIL_TEMPLATE_FILE_PATH);
    gmail:MessageRequest leadMessageRequest = {
        recipient: leadEmail,
        subject: "End of Evaluation Period",
        messageBody: leadEmailTemplate,
        contentType: gmail:TEXT_HTML,
        sender: "Fleet Inc <contact.fleetinc@gmail.com>"
    };
    gmail:Message leadGmailResponse = check gmailClient->sendMessage(leadMessageRequest, userId = userId);
    log:printInfo("### Email sent successfully for lead: " + leadEmail);
    if (isDebugEnabled) {
        log:printInfo("DEBUG: Gmail response for lead: " + leadGmailResponse.toString());
    }
    return true;
}
