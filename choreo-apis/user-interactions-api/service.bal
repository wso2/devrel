
// User Interactions API

import ballerina/http;
import ballerinax/hubspot.crm.contact;
import ballerina/log;

configurable string hubspotClientId = ?;
configurable string hubspotClientSecret = ?;
configurable string hubspotRefreshToken = ?;

type Interaction record {
    string email;
    int iotDevicesVisits;
    int mobileSubscriptionVisits;
    int smartPhoneVisits;
    int tvSubscriptionVisits;
};

enum EventType {
    IOT_DEVICES_VISITS = "IOT_DEVICES_VISITS",
    MOBILE_SUBSCRIPTION_VISITS = "MOBILE_SUBSCRIPTION_VISITS",
    SMART_PHONE_VISITS = "SMART_PHONE_VISITS",
    TV_SUBSCRIPTION_VISITS = "TV_SUBSCRIPTION_VISITS"
};

const map<int> eventWeights = {
    IOT_DEVICES_VISITS: 1,
    MOBILE_SUBSCRIPTION_VISITS: 2,
    SMART_PHONE_VISITS: 3,
    TV_SUBSCRIPTION_VISITS: 2
};

service / on new http:Listener(9090) {

    resource function post interactions(@http:Payload Interaction interaction) returns http:Ok|http:BadRequest|http:NotFound|error {

        error? invalidPayload = validateInteractionPayload(interaction);
        if invalidPayload is error {
            http:BadRequest br = {};
            return br;
        }

        contact:PublicObjectSearchRequest searchContact = getHubspotContactSearchPayload(interaction.email);
        contact:Client contactEndpoint = check getHubspotClient().ensureType();
        contact:CollectionResponseWithTotalSimplePublicObjectForwardPaging search = check contactEndpoint->search(searchContact);
        log:printInfo(string`### No. of Hubspot search results for the email: ${interaction.email} - ${search.total}`);

        if search.total == 1 {
            contact:SimplePublicObject[] contacts = search.results;
            string|() iotDevicesVisits = check contacts[0].properties["iot_devices_visits"].ensureType();
            string|() mobileSubscriptionVisits = check contacts[0].properties["mobile_subscription_visits"].ensureType();
            string|() smartPhoneVisits = check contacts[0].properties["smartphone_visits"].ensureType();
            string|() tvSubscriptionVisits = check contacts[0].properties["tv_subscription_visits"].ensureType();
            string|() interactionScore = check contacts[0].properties["interaction_score"].ensureType();

            int scoreIncrement = calculateScoreIncrement(interaction);
            // Update contact.
            contact:SimplePublicObjectInput updatePayload = {
                "properties": {
                    "iot_devices_visits" : iotDevicesVisits == () ? interaction.iotDevicesVisits : check int:fromString(iotDevicesVisits) + interaction.iotDevicesVisits,
                    "mobile_subscription_visits" : mobileSubscriptionVisits == () ? interaction.mobileSubscriptionVisits : check int:fromString(mobileSubscriptionVisits) + interaction.mobileSubscriptionVisits,
                    "smartphone_visits": smartPhoneVisits == () ? interaction.smartPhoneVisits : check int:fromString(smartPhoneVisits) + interaction.smartPhoneVisits,
                    "tv_subscription_visits": tvSubscriptionVisits == () ? interaction.tvSubscriptionVisits : check int:fromString(tvSubscriptionVisits) + interaction.tvSubscriptionVisits,
                    "interaction_score": interactionScore == () ? scoreIncrement : check int:fromString(interactionScore) + scoreIncrement
                }
            };
            contact:SimplePublicObject _ = check contactEndpoint->update(contacts[0].id, updatePayload);
            log:printInfo(string`### Hubspot contact updated for: ${interaction.email}`);
            
            http:Ok ok = { body: "Score updated."};
            return ok;
        } else {
            http:NotFound nf = {};
            return nf;
        }
    }

    # Return customer interactions based on a given category
    #
    # + category - One of valid category ["iot_devices_visits", "mobile_subscription_visits", "smartphone_visits", "tv_subscription_visits"]
    # + return - Returns a list of users that have interactions with the given category
    resource function get interactionsByCategory(string category) returns http:Ok|http:NotFound|http:BadRequest|error {

        if (category != "iot_devices_visits" && category != "mobile_subscription_visits" && 
            category != "smartphone_visits" && category != "tv_subscription_visits") {
            http:BadRequest br = {};
            return br;
        }

        contact:Client contactEndpoint = check getHubspotClient().ensureType();

        contact:PublicObjectSearchRequest searchContact = getHubspotContacts(category);
        contact:CollectionResponseWithTotalSimplePublicObjectForwardPaging search = check contactEndpoint->search(searchContact);
        log:printInfo(search.toString());

        json[] results = [];
        if (search.total > 0) {
            contact:SimplePublicObject[] contacts = search.results;
            foreach contact:SimplePublicObject contact in contacts {
                string|() email = check contact.properties["email"].ensureType();
                string|() iotDevicesVisits = check contact.properties["iot_devices_visits"].ensureType();
                string|() mobileSubscriptionVisits = check contact.properties["mobile_subscription_visits"].ensureType();
                string|() smartPhoneVisits = check contact.properties["smartphone_visits"].ensureType();
                string|() tvSubscriptionVisits = check contact.properties["tv_subscription_visits"].ensureType();
                string|() interactionScore = check contact.properties["interaction_score"].ensureType();

                json interactions = {
                    email: email,
                    mobileSubscriptionVisits: mobileSubscriptionVisits == () ? 0 : check int:fromString(mobileSubscriptionVisits),
                    iotDevicesVisits: iotDevicesVisits == () ? 0 : check int:fromString(iotDevicesVisits),
                    smartPhoneVisits: smartPhoneVisits == () ? 0 : check int:fromString(smartPhoneVisits),
                    tvSubscriptionVisits: tvSubscriptionVisits == () ? 0 : check int:fromString(tvSubscriptionVisits),
                    interactionScore: interactionScore == () ? 0 : check int:fromString(interactionScore)
                };

                results[results.length()] = interactions;
            }
            http:Ok ok = { 
                body: results 
            };
            return ok;
        } else {
            http:NotFound nf = {
                body: {
                    message: "No customers found with interest to " + category
                }
            };
            return nf;
        }
    }

    resource function get interactions(string email) returns http:Ok|http:NotFound|error {
    
        contact:Client contactEndpoint = check getHubspotClient().ensureType();

        contact:PublicObjectSearchRequest searchContact = getHubspotContactSearchPayload(email);

        contact:CollectionResponseWithTotalSimplePublicObjectForwardPaging search = check contactEndpoint->search(searchContact);
        log:printInfo(string`### No. of Hubspot search results for the email: ${email} - ${search.total}`);

        if search.total == 1 {
            contact:SimplePublicObject[] contacts = search.results;
            string|() iotDevicesVisits = check contacts[0].properties["iot_devices_visits"].ensureType();
            string|() mobileSubscriptionVisits = check contacts[0].properties["mobile_subscription_visits"].ensureType();
            string|() smartPhoneVisits = check contacts[0].properties["smartphone_visits"].ensureType();
            string|() tvSubscriptionVisits = check contacts[0].properties["tv_subscription_visits"].ensureType();
            string|() interactionScore = check contacts[0].properties["interaction_score"].ensureType();

            json interactions = {
                email: email,
                mobileSubscriptionVisits: mobileSubscriptionVisits == () ? 0 : check int:fromString(mobileSubscriptionVisits),
                iotDevicesVisits: iotDevicesVisits == () ? 0 : check int:fromString(iotDevicesVisits),
                smartPhoneVisits: smartPhoneVisits == () ? 0 : check int:fromString(smartPhoneVisits),
                tvSubscriptionVisits: tvSubscriptionVisits == () ? 0 : check int:fromString(tvSubscriptionVisits),
                interactionScore: interactionScore == () ? 0 : check int:fromString(interactionScore)
            };
            http:Ok ok = { body: interactions };
            return ok;
        } else {
            http:NotFound nf = {};
            return nf;
        }
    }
}

isolated function getHubspotClient() returns contact:Client|error? {

    return new ({
        auth: {
            refreshUrl: "https://api.hubapi.com/oauth/v1/token",
            refreshToken: hubspotRefreshToken,
            clientId: hubspotClientId,
            clientSecret: hubspotClientSecret,
            credentialBearer: "POST_BODY_BEARER"
        }
    });
}

isolated function getHubspotContactSearchPayload(string leadEmail) returns contact:PublicObjectSearchRequest {

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
            "iot_devices_visits", "mobile_subscription_visits", "smartphone_visits", "tv_subscription_visits", "interaction_score"
        ],
        "limit": 1,
        "after": 0
    };
}

isolated function getHubspotContacts(string category) returns contact:PublicObjectSearchRequest {

    return {
        "filterGroups": [
            {
                "filters": [
                    {
                        "value": "0",
                        "propertyName": category,
                        "operator": "GT"
                    }
                ]
            }
        ],
        "sorts": [
            "id"
        ],
        "query": "",
        "properties": [
            "email", "iot_devices_visits", "mobile_subscription_visits", "smartphone_visits", "tv_subscription_visits", "interaction_score"
        ],
        "limit": 100,
        "after": 0
    };
}

isolated function validateInteractionPayload(Interaction interaction) returns error? {

    if (interaction.mobileSubscriptionVisits < 0 || interaction.iotDevicesVisits < 0 ||
     interaction.smartPhoneVisits < 0 || interaction.tvSubscriptionVisits < 0) {
         return error("Bad request.");
     }
}

isolated function calculateScoreIncrement(Interaction interaction) returns int {

    int scoreIncrement = (interaction.mobileSubscriptionVisits * eventWeights.get(MOBILE_SUBSCRIPTION_VISITS)) +
        (interaction.iotDevicesVisits * eventWeights.get(IOT_DEVICES_VISITS)) +
        (interaction.tvSubscriptionVisits * eventWeights.get(TV_SUBSCRIPTION_VISITS)) +
        (interaction.smartPhoneVisits * eventWeights.get(SMART_PHONE_VISITS));
    return scoreIncrement; 
}
