
// Account Verification API

import ballerina/http;
import ballerina/log;
import ballerinax/twilio;
import ballerina/random;
import ballerinax/hubspot.crm.contact;
import ballerinax/googleapis.gmail;
import ballerina/url;

configurable string AsgardeoClientID = ?;
configurable string AsgardeoClientSecret = ?;
configurable string AsgardeoOrganization = "kfone";
configurable string TwilioAccountSId = ?;
configurable string TwilioAPIKey = ?;
configurable string TwilioAPISecret = ?;
configurable string TwilioFromNumber = ?;
configurable string HubSpotClientId = ?;
configurable string HubSpotClientSecret = ?;
configurable string HubSpotRefreshToken = ?;
configurable string googleClientId = ?;
configurable string googleClientSecret = ?;
configurable string googleRefreshToken = ?;

const string asgardeoBaseUrl = "https://api.asgardeo.io/t";
const string scimEndpoint = "/scim2/Users";
const string tokenEndpoint = "/oauth2/token";
const string hubspotTokenEndpoint = "https://api.hubapi.com/oauth/v1/token";
const string demoEmailAddress = "iam-demo@wso2.com";
configurable boolean isDebugEnabled = false;
configurable boolean sendOTP = true;
configurable boolean sendOTPInMail = false;

type User readonly & record {

    string email;
    string mobile;
};

service /smsOtp on new http:Listener(9090) {

    # Initiates mobile number verification by sending an SMS OTP to the given user.
    # + user - the user object with email and mobile number. Mobile number should be with country code. Ex: +94770230023
    # + return - sent OTP if success.
    resource function post initiate(@http:Payload User user) returns http:Ok|http:BadRequest|http:InternalServerError|http:NotFound|error? {

        // Get user ID from asgardeo
        http:InternalServerError|http:BadRequest|http:NotFound|json|error result = 
            check getAsgardeoAccountByEmail(check url:encode(user.email, "UTF-8"));
        if result is http:InternalServerError|http:BadRequest|http:NotFound {
            return result;
        } else if result is json {
            string userId = check result.id;
            // Update mobile number of the user
            json|error updateResponse = check updateMobileNumber(userId, user.mobile);
            if updateResponse is error || updateResponse.err == true {
                http:InternalServerError e = {
                    body: {
                        status: "Failure",
                        message: "Error while updating the mobile number of the user: " + user.email
                    }
                };
                return e;

            }
            
            // Generate and send SMS OTP
            string otp = check generateOTP(6);

            // Send the same OTP to a backup email address
            if sendOTPInMail {
                check sendEmail(user.email, otp);
            }
            
            if sendOTP {
                error? err = sendSMS(user.mobile, otp);
                if err is error {
                    log:printInfo(string`### ERROR - SMS sending failed for the user: ${user.email}`);
                    log:printInfo(err.toString());
                    
                    http:InternalServerError e = {
                        body: {
                            status: "Failure",
                            message: "SMS sending failed for the user: " + user.email
                        }
                    };
                    return e;
                }
            }

            
            
            http:Ok ok = {
                body: {
                    status: "Success",
                    otp: otp
                }
            };
            return ok;
        } else {
            http:InternalServerError e = {};
            return e;
        }
    }

    # Updates user Asgardeo account with mobile number verification status and create new contact in hubspot
    # + user - the user object with email and mobile number.
    # + return - 200 OK on success
    resource function post verify(@http:Payload User user) returns http:Ok|http:BadRequest|http:InternalServerError|http:NotFound|error? {

        // Get user ID from asgardeo
        http:InternalServerError|http:BadRequest|http:NotFound|json|error result = 
            check getAsgardeoAccountByEmail(check url:encode(user.email, "UTF-8"));
        if result is http:InternalServerError|http:BadRequest|http:NotFound {
            return result;
        } else if result is json {
            string userId = check result.id;
            // Update mobile number of the user
            json|error updateResponse = verifyAsgardeoAccount(userId);
            if updateResponse is error || updateResponse.err == true {
                http:InternalServerError e = {
                    body: {
                        status: "Failure",
                        message: "Error while updating the verification status of the user: " + user.email
                    }
                };
                return e;

            }

            // Create new contact in Hubspot
            contact:SimplePublicObject|error hubspotResponse = createHubspotContact(user.email);
            if hubspotResponse is error {
                // If an unknown error is thrown
                http:InternalServerError e = {
                    body: {
                        status: "Failure",
                        message: "Hubspot account creation failed for the user: " + user.email + " - " + hubspotResponse.toString()
                    }
                };
                return e;
            } else {
                if isDebugEnabled {
                    log:printInfo(string`### DEBUG - HubSpot contact creation request sent for the email: ${user.email}`);
                    log:printInfo(hubspotResponse.toString());
                }
            }

            http:Ok ok = {};
            return ok;
        } else {
            http:InternalServerError e = {};
            return e;
        }
    }
}

// Generates an OTP with random numbers.
function generateOTP(int digitCount) returns string|error {

    string otp = "";
    foreach var i in 1...digitCount {
        int randomInteger = check random:createIntInRange(0, 10);
        otp += randomInteger.toString();   
    }
    if isDebugEnabled {
        log:printInfo(string`### DEBUG - Generated OTP - ${otp}`);
    }
    return otp;
}

// Sends the given OTP to the given mobile number.
function sendSMS(string mobile, string otp) returns error? {

    twilio:ConnectionConfig twilioConfig = {
        auth: {
            accountSId: TwilioAccountSId,
            apiKey: TwilioAPIKey,
            apiSecret: TwilioAPISecret
        }
    };

    twilio:Client twilioClient = check new (twilioConfig);

    string message = "Your KFone verfication code is: " + otp;
    twilio:SmsResponse response = check twilioClient->sendSms(TwilioFromNumber, mobile, message);
    if isDebugEnabled {
        log:printInfo(string`### DEBUG - SMS_SID: ${response.sid.toString()}, Body: ${response.body.toString()}`);
    }
}

// Update mobile number verification status of the given Asgardeo user account.
function verifyAsgardeoAccount(string userId) returns json|error? {

    // Patch Asgardeo user account.
    json scimUserUpdatePayload = {
        "schemas": [
            "urn:ietf:params:scim:api:messages:2.0:PatchOp"
        ],
        "Operations": [
            {
                "op": "replace",
                "value": {
                    "urn:scim:wso2:schema": {
                        "mobileNumberVerified": true
                    }
                }
            }
        ]
    };

    return sendSCIMPatch(userId, scimUserUpdatePayload);
}

// Update mobile number verification status of the given Asgardeo user account.
function updateMobileNumber(string userId, string mobile) returns json|error? {

    // Patch Asgardeo user account.
    json scimUserUpdatePayload = {
        "schemas": [
            "urn:ietf:params:scim:api:messages:2.0:PatchOp"
        ],
        "Operations": [
            {
                "op": "replace",
                "value": {
                    "phoneNumbers": [
                        {
                            "type": "mobile",
                            "value": mobile
                        }
                    ]
                }
            }
        ]
    };

    return sendSCIMPatch(userId, scimUserUpdatePayload);
}

// Send SCIM Patch request
function sendSCIMPatch(string userId, json payload) returns json|error? {

    string asgardeoBaseUrlWithOrg = asgardeoBaseUrl + "/" + AsgardeoOrganization;
    string asgardeoTokenUrl = asgardeoBaseUrlWithOrg + tokenEndpoint;

    http:Client AsgardeoClient = check new (asgardeoBaseUrlWithOrg,
        auth = {
            tokenUrl: asgardeoTokenUrl,
            clientId: AsgardeoClientID,
            clientSecret: AsgardeoClientSecret,
            scopes: ["internal_user_mgt_update"]
        }
    );

    string path = scimEndpoint + "/" + userId;
    http:Response response = check AsgardeoClient->patch(path, payload);

    match response.statusCode {
        http:STATUS_OK => {
            return {};
        }
        _ => {
            log:printInfo(string`### INFO - Asgardeo user account update error - ${check response.getTextPayload()}`);
            return {
                err: true,
                msg: check response.getTextPayload()
            };
        }
    }
}

// Creates a new hubspot account for the given email address.
function createHubspotContact(string email) returns contact:SimplePublicObject|error {

    contact:Client hubspotEndpoint = check new ({
        auth: {
            refreshUrl: hubspotTokenEndpoint,
            refreshToken: HubSpotRefreshToken,
            clientId: HubSpotClientId,
            clientSecret: HubSpotClientSecret,
            credentialBearer: "POST_BODY_BEARER"
        }
    });

    contact:SimplePublicObjectInput contactPayload = {
        "properties": {
            "email": email
        }
    };
    return hubspotEndpoint->create(contactPayload);
}

function sendEmail(string email, string otp) returns error? {

    gmail:ConnectionConfig gmailConfig = {
        auth: {
            refreshUrl: gmail:REFRESH_URL,
            refreshToken: googleRefreshToken,
            clientId: googleClientId,
            clientSecret: googleClientSecret
        }
    };

    gmail:Client gmailClient = check new (gmailConfig);
    string userId = "me";

    gmail:MessageRequest messageRequest = {
        recipient: demoEmailAddress,
        subject: "Kfone OTP - " + email,
        messageBody: otp,
        contentType: gmail:TEXT_HTML,
        sender: "Kfone Marketing <marketing.kfone@gmail.com>"
    };
    gmail:Message _ = check gmailClient->sendMessage(messageRequest, userId = userId);
}

// Retrive user details from Asgardeo based on the email address.
isolated function getAsgardeoAccountByEmail(string email) returns http:InternalServerError|http:BadRequest|http:NotFound|json|error {

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

    string path = scimEndpoint + "?attributes=id&filter=emails+co+" + email;
    http:Response response = check AsgardeoClient->get(path);

    match response.statusCode {
        http:STATUS_OK => {
            json responseJson = check response.getJsonPayload();
            if (isDebugEnabled) {
                log:printInfo(string`### DEBUG - Asgardeo repsonse for email: ${email} - ${responseJson.toString()}`);
            }

            int totalResults = check responseJson.totalResults;
            if (totalResults == 1) {
                json[] resources = check responseJson.Resources.ensureType();
                return resources[0];
            } else if (totalResults > 1) {
                log:printInfo(string`### ERROR - There are multiple Asgardeo users with the email: ${email}`);
                http:BadRequest nf = {
                    body: {
                        message: "There are multiple Asgardeo users with the email: " + email
                    }
                };
                return nf;
            } else {
                log:printInfo(string`### ERROR - Asgardeo user not found for the email: ${email}`);
                http:NotFound nf = {
                    body: {
                        message: "Couldn't find a user with the email address: " + email
                    }
                };
                return nf;
            }
        }
        http:STATUS_NOT_FOUND => {
            log:printInfo(string`### INFO - Asgardeo user not found for the email: ${email}`);
            http:NotFound nf = {};
            return nf;
        }
        _ => {
            log:printInfo(string`### INFO - Asgardeo user retrival error - ${check response.getTextPayload()}`);
            http:InternalServerError e = {};
            return e;
        }
    }
}
