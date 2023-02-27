import ballerinax/hubspot.crm.contact;
import ballerina/log;
import ballerina/http;

configurable string hubspotClientId = ?;
configurable string hubspotClientSecret = ?;
configurable string hubspotRefreshToken = ?;

type Lead readonly & record {
    string email;
    string firstname;
    string lastname;
    string company;
};

service / on new http:Listener(9090) {

    resource function post trackWebinarRegistration(@http:Payload Lead lead) returns error? {

        // Create a lead contact in hubspot if not exists.
        contact:Client contactEndpoint = check new ({
            auth: {
               refreshUrl: "https://api.hubapi.com/oauth/v1/token",
               refreshToken: hubspotRefreshToken,
               clientId: hubspotClientId,
               clientSecret: hubspotClientSecret,
               credentialBearer: "POST_BODY_BEARER"
            }
        });
        contact:PublicObjectSearchRequest searchContact = getHubspotContactSearchPayload(lead.email);
        
        contact:CollectionResponseWithTotalSimplePublicObjectForwardPaging search = check contactEndpoint->search(searchContact);
        log:printInfo(string`### No. of Hubspot search results for the email: ${lead.email} - ${search.total}`);

        if search.total == 1 {
            contact:SimplePublicObject[] contacts = search.results;
            string newLifeCycleStatus = check getLifeCycleStage(contacts);

            string? noOfRegistrations = check contacts[0].properties["no_webinar_registrations"].ensureType();
            int newNoOfRegistrations;
            if noOfRegistrations is () {
                newNoOfRegistrations = 1;
            } else {
                newNoOfRegistrations = check int:fromString(noOfRegistrations) + 1;
            }
            log:printInfo(string`### Hubspot webinar registrations: ${newNoOfRegistrations}`);

            // Update contact.
            contact:SimplePublicObjectInput updatePayload = {
                "properties": {
                    "lifecyclestage" : newLifeCycleStatus,
                    "no_webinar_registrations" : newNoOfRegistrations,
                    "firstname": lead.firstname,
                    "lastname": lead.lastname,
                    "company": lead.company
                }
            };
            contact:SimplePublicObject _ = check contactEndpoint->update(contacts[0].id, updatePayload);
            log:printInfo(string`### Hubspot contact updated for: ${lead.email}`);
            
        } else {
            // Create hubspot contact.
            contact:SimplePublicObjectInput contactPayload =
                {
                "properties": {
                    "email": lead.email,
                    "firstname": lead.firstname,
                    "lastname": lead.lastname,
                    "company": lead.company,
                    "lifecyclestage" : "lead",
                    "no_webinar_registrations" : 1
                }
            };
            contact:SimplePublicObject _ = check contactEndpoint->create(contactPayload);
            log:printInfo(string`### Hubspot contact created for: ${lead.email}`);
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
            "lifecyclestage", "no_webinar_registrations"
        ],
        "limit": 1,
        "after": 0
    };
}
