
// Asgardeo User Registration Webhook

import ballerinax/trigger.asgardeo;
import ballerina/http;
import ballerina/log;
import ballerinax/hubspot.crm.contact;

configurable string HubSpotClientId = ?;
configurable string HubSpotClientSecret = ?;
configurable string HubSpotRefreshToken = ?;

configurable asgardeo:ListenerConfig config = ?;

configurable boolean isDebugEnabled = false;

const string hubspotTokenEndpoint = "https://api.hubapi.com/oauth/v1/token";
const string emailAddressClaimURI = "http://wso2.org/claims/emailaddress";

listener http:Listener httpListener = new(8090);
listener asgardeo:Listener webhookListener =  new(config,httpListener);

service asgardeo:RegistrationService on webhookListener {
  
    remote function onAddUser(asgardeo:AddUserEvent event ) returns error? {
      
        if isDebugEnabled {
            log:printInfo("onAddUser event received.");
            log:printInfo(event.toString());
        }

        map<string>? claims = event.eventData?.claims;

        if claims !is map<string> {
            log:printError(string`Error whilte creating Hubspot contact: Claim map couldn't be found in the event payload.`);
            return ();
        }

        if !claims.hasKey(emailAddressClaimURI) {
            log:printError(string`Error whilte creating Hubspot contact: Email address couldn't be found in the event payload.`);
            return ();
        }
        
        string email = <string>claims[emailAddressClaimURI];
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
        contact:SimplePublicObject|error hubspotResponse = hubspotEndpoint->create(contactPayload);
        if hubspotResponse is error {
            log:printError(string`Hubspot account creation call failed! - ${hubspotResponse.toString()}`);
        } else {
            if isDebugEnabled {
                log:printInfo(string`HubSpot contact creation request sent for the email: ${email}`);
                log:printInfo(hubspotResponse.toString());
            }
        }
    }

    remote function onConfirmSelfSignup(asgardeo:GenericEvent event ) returns error? {

    }

    remote function onAcceptUserInvite(asgardeo:GenericEvent event ) returns error? {

    }
}

service /ignore on httpListener {}
