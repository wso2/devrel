import ballerinax/trigger.salesforce;
import ballerinax/salesforce as sfdc;
import ballerinax/servicenow;
import ballerinax/slack;
import ballerina/http;
import ballerina/log;
import ballerinax/googleapis.gmail;
import ballerinax/hubspot.crm.contact;
import ballerina/regex;
import ballerina/io;

type User record {
    string lastName;
    string firstName;
    string email;
};

type CustomerAccount record {
    string accountName;
    User customerContact;
};

type AccountManager record {
    string name;
    string email;
};

configurable string slackToken = ?;
configurable string SFRefreshToken = ?;
configurable string SFClientID = ?;
configurable string SFClientSecret = ?;
configurable string SFUsername = ?;
configurable string SFPassword = ?;
configurable string googleRefreshToken = ?;
configurable string googleClientID = ?;
configurable string googleClientSecret = ?;
configurable string hubspotRefreshToken = ?;
configurable string hubspotClientID = ?;
configurable string hubspotClientSecret = ?;
configurable string serviceNowPassword = ?;
configurable string AsgardeoClientID = ?;
configurable string AsgardeoClientSecret = ?;

configurable string channelName = "general";
configurable string serviceNowUrl = "https://dev122092.service-now.com";
configurable boolean isDebugEnabled = false;
string asgardeoBaseUrl = "https://api.asgardeo.io/t/asgardeodemo/";
string scimEndpoint = "scim2/Users";
string EMAIL_TEMPLATE_FILE_PATH = "resources/won-opp-email-template.html";

salesforce:ListenerConfig salesForceConfig = {
    username: SFUsername,
    password: SFPassword,
    channelName: "/data/LeadChangeEvent",
    replayFrom: -1
}; 

listener salesforce:Listener webhookListener = new(salesForceConfig);

service salesforce:StreamingEventService on webhookListener {
    
    remote function onCreate(salesforce:EventData payload ) returns error? {
      // Not Implemented
    }
    remote function onUpdate(salesforce:EventData payload ) returns error? {
      
        map<json> changedData = payload.changedData;
        string statusChange = "";
        if (!changedData.hasKey("Status")) {
            return;
        }
        
        if (isDebugEnabled) {
            log:printInfo("DEBUG: SF status change payload: " + payload.toString());
        }

        statusChange = <string> changedData.get("Status");
        string sLeadId = payload?.metadata?.recordId ?: "";

        if (statusChange == "evaluation") {
            log:printInfo("### SF status change: " + statusChange + " received for the user ID: " + sLeadId);
            error? result = handleEvaluationState(payload);
            if result is error {
                log:printInfo("### Handling status change: " + statusChange + " failed.", result);
            }
        } else if (statusChange == "customer") {
            log:printInfo("### SF status change: " + statusChange + " received for the user ID: " + sLeadId);
            error? result = handleCustomerState(payload);
            if result is error {
                log:printInfo("### Handling status change: " + statusChange + " failed.", result);
            }
        } else {
            log:printInfo("### Unknown SF status change: " + statusChange + " received for the user ID: " + sLeadId);
        }

        log:printInfo("============================================");
    }
    remote function onDelete(salesforce:EventData payload ) returns error? {
      // Not Implemented
    }
    remote function onRestore(salesforce:EventData payload ) returns error? {
      // Not Implemented
    }
}

# Opportunity updated to evaluation - Create SN Account and create Asgardeo account for the user.
#
# + payload - Salesforce event payload
# + return - Error if occurred
function handleEvaluationState(salesforce:EventData payload) returns error? {

    json leadRecord = check getSFLeadRecord(payload);
    
    string firstName = check leadRecord.FirstName;
    string lastName = check leadRecord.LastName;
    string email = check leadRecord.Email;
    string company = check leadRecord.Company;

    // Create a SN account.
    servicenow:Client servicenowEndpoint = check new ({
        auth: {
            username: "admin", 
            password: serviceNowPassword
        }
    }, serviceNowUrl);
    
    // Check customer existence, if not Create a SN customer.
    json getResult = check servicenowEndpoint->getRecordList("customer_contact", sysparmQuery = "email="+email);
    json[] result = check getResult.result.ensureType();
    if (result.length() == 0) {
        log:printInfo("### Creating new account in SN for the email: " + email);

        json account = {
            name: company, 
            customer: false
        };
        json customerAccountCreateResult = check servicenowEndpoint->createRecord("customer_account", account);
        
        log:printInfo("### SN customer_account record created.");
        if (isDebugEnabled) {
            log:printInfo("DEBUG: SN customer_account create record: " + customerAccountCreateResult.toString());
        }

        json contact = {
            user_name : email, 
            email : email, 
            first_name : firstName,
            last_name : lastName,
            account : company,
            password_needs_reset: "false"
        };
        json customerContactCreateResult = check servicenowEndpoint->createRecord("customer_contact", contact);
        log:printInfo("### SN customer_contact record created.");
        if (isDebugEnabled) {
            log:printInfo("DEBUG: SN customer_contact create record: " + customerContactCreateResult.toString());
        }
    } else {
        log:printInfo("### Account for the email: " + email + " already exists in SN.");
    }

    // Create Asgardeo customer with askpassword flow.
    json scimUserCreationPayload =
        {
            "emails":[
                {
                    "primary":true,
                    "value":email
                }],
            "name":{
                "familyName": lastName,
                "givenName": firstName
            },
            "urn:scim:wso2:schema":{
                "askPassword":"true"
            },
            "userName":"DEFAULT/"+ email
        };
    http:Client AsgardeoUserEP = check new (asgardeoBaseUrl,
        auth = {
            tokenUrl: "https://api.asgardeo.io/t/asgardeodemo/oauth2/token",
            clientId: AsgardeoClientID,
            clientSecret: AsgardeoClientSecret,
            scopes: ["internal_user_mgt_create"]
        }
    );

    http:Response userCreationResponse = check AsgardeoUserEP->post(scimEndpoint, scimUserCreationPayload);
    log:printInfo("### Asgardeo user created for the email: " + email + " and status code : " + userCreationResponse.statusCode.toString());
    if (isDebugEnabled) {
        log:printInfo(check userCreationResponse.getTextPayload());
    }
}

# Opportunity won -> update hubspot and SN account status, and send notifications.
#
# + payload - Salesforce event payload
# + return - Error if occurred
function handleCustomerState(salesforce:EventData payload) returns error? {

    json leadRecord = check getSFLeadRecord(payload);
    string email = check leadRecord.Email;
    string company = check leadRecord.Company;

    // Update hubspot contact to sales qualified lead.
    error? hubspot = updateHubspotLifecycleStage(email, "customer");
    if hubspot is error {
        log:printInfo("### Updating hubspot account failed for the user: " + email, hubspot);
    }

    // Update SN account to a customer
    servicenow:Client servicenowEndpoint = check new ({
        auth: {
            username: "admin",
            password: serviceNowPassword
        }
    }, serviceNowUrl);
    
    json getResult = check servicenowEndpoint->getRecordList("customer_account", sysparmQuery = "name="+company);
    json[] result = check getResult.result.ensureType();

    if (result.length() > 0) {
        
        log:printInfo("### Updating account to Customer in SN for the email: " + email);
        string sysId = check result[0].sys_id;
        json account = {
            name: company, 
            customer: true
        };
        json customerAccountUpdateResult = check servicenowEndpoint->updateRecord("customer_account", sysId, account);
        log:printInfo("### SN record updated.");
        if (isDebugEnabled) {
            log:printInfo("DEBUG: SN customer_account create record: " + customerAccountUpdateResult.toString());
        }
    } else {
        log:printInfo("### Account for the email: " + email + " already exists in SN.");
    }

    // Send notifications
    AccountManager am = check getAMFromSalesforce(email);
    if (am.email != "") {
        boolean|error sendNotificationsResult = sendNotifications(email, am);
        if (sendNotificationsResult is error) {
            log:printInfo("Error while sending notifications: ", sendNotificationsResult);
        }
    }
}

function updateHubspotLifecycleStage(string email, string lifecycleStage) returns error? {

    log:printInfo("### Updating hubspot account status to: " + lifecycleStage + " of the user: " + email);

    contact:Client contactEndpoint = check new ({
        auth: {
            refreshUrl: "https://api.hubapi.com/oauth/v1/token",
            refreshToken: hubspotRefreshToken,
            clientId: hubspotClientID,
            clientSecret: hubspotClientSecret,
            credentialBearer: "POST_BODY_BEARER"
        }
    });
    contact:PublicObjectSearchRequest searchContact = {
        "filterGroups": [
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
        "sorts": [
            "id"
        ],
        "query": "",
        "properties": [
            "lifecyclestage"
        ],
        "limit": 1,
        "after": 0
    };
    contact:CollectionResponseWithTotalSimplePublicObjectForwardPaging search = check contactEndpoint->search(searchContact);
    string contactID = "";
    if (search.total == 1) {
        contact:SimplePublicObject[] contacts = search.results;
        contactID = contacts[0].id;
        contact:SimplePublicObjectInput updatePayload = {
        "properties": {
                "lifecyclestage" : lifecycleStage
            }
        };
        contact:SimplePublicObject update = check contactEndpoint->update(contactID, updatePayload);
        log:printInfo("### Hubspot update completed.");
        if (isDebugEnabled) {
            log:printInfo("DEBUG: Hubspot update record: " + update.toString());
        }
    } else {
        log:printInfo("### Hubspot contact coundn't be found for the email: " + email);
    }
}

function getSFLeadRecord(salesforce:EventData payload) returns json|error? {

    string sLeadId = payload?.metadata?.recordId ?: "";
    
    sfdc:Client sfdcClient = check new ({
        baseUrl: "https://wso2-2d-dev-ed.my.salesforce.com",
        clientConfig: {
            clientId: SFClientID,
            clientSecret: SFClientSecret,
            refreshToken: SFRefreshToken,
            refreshUrl: "https://wso2-2d-dev-ed.my.salesforce.com/services/oauth2/token"
        }
    });

    json leadRecord = check sfdcClient->getLeadById(sLeadId.toString());
    log:printInfo("### Returning SF lead record for ID: " + sLeadId);
    if (isDebugEnabled) {
        log:printInfo("DEBUG: SF lead record: " + leadRecord.toString());
    }
    return leadRecord;
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
            clientId: SFClientID,
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

function sendNotifications(string customerEmail, AccountManager am) returns boolean|error {

    string kycURL = "http://localhost:8080/ciam-2.0-poc-c360-dashboard/home.jsp" + "?ref=" + customerEmail.toBytes().toBase64();

    // Post a message to slack channel.
    slack:Client slackEndpoint = check new ({auth: {token: slackToken}});
    slack:Message mesage = {channelName: channelName, text: "*Opportunity Won!*\n\n" + customerEmail
        + " has been converted to a customer by " + am.email + ". \nPlease use this <" + kycURL + "|link> to check customer details."};
    string slackResponse = check slackEndpoint->postMessage(mesage);
    log:printInfo("### Slack message posted successfully for customer: " + customerEmail);
    if (isDebugEnabled) {
        log:printInfo("DEBUG: Slack response: " + slackResponse.toString());
    }

    // Send an email to defined receipient.
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
    emailTemplate = regex:replaceAll(emailTemplate, "<CUSTOMER_EMAIL>", customerEmail);
    emailTemplate = regex:replaceAll(emailTemplate, "<AM_NAME>", am.name);

    gmail:Client gmailClient = check new (gmailConfig);
    string userId = "me";
    gmail:MessageRequest messageRequest = {
        recipient: am.email,
        subject: "Opportunity Won! - " + customerEmail,
        messageBody: emailTemplate,
        contentType: gmail:TEXT_HTML,
        sender: "Fleet Inc <contact.fleetinc@gmail.com>"
    };
    gmail:Message gmailResponse = check gmailClient->sendMessage(messageRequest, userId = userId);
    log:printInfo("### Email sent successfully for customer: " + customerEmail);
    if (isDebugEnabled) {
        log:printInfo("DEBUG: Gmail response: " + gmailResponse.toString());
    }

    return true;
}
