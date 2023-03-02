
// User Interactions API

import ballerina/http;
import ballerinax/hubspot.crm.contact;
import ballerina/log;

configurable string hubspotClientId = ?;
configurable string hubspotClientSecret = ?;
configurable string hubspotRefreshToken = ?;

type Interaction record {
    string email;
    int phoneClicks;
    int dealClicks;
    int phoneSubscriptionClicks;
    int tvSubscriptionClicks;
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
            string|() phoneClicks = check contacts[0].properties["iot_devices_visits"].ensureType();
            string|() dealClicks = check contacts[0].properties["mobile_subscription_visits"].ensureType();
            string|() phoneSubscriptionClicks = check contacts[0].properties["smartphone_visits"].ensureType();
            string|() tvSubscriptionClicks = check contacts[0].properties["tv_subscription_visits"].ensureType();
            string|() interactionScore = check contacts[0].properties["interaction_score"].ensureType();

            int scoreIncrement = calculateScoreIncrement(interaction);
            // Update contact.
            contact:SimplePublicObjectInput updatePayload = {
                "properties": {
                    "iot_devices_visits" : phoneClicks == () ? interaction.phoneClicks : check int:fromString(phoneClicks) + interaction.phoneClicks,
                    "mobile_subscription_visits" : dealClicks == () ? interaction.dealClicks : check int:fromString(dealClicks) + interaction.dealClicks,
                    "smartphone_visits": phoneSubscriptionClicks == () ? interaction.phoneSubscriptionClicks : check int:fromString(phoneSubscriptionClicks) + interaction.phoneSubscriptionClicks,
                    "tv_subscription_visits": tvSubscriptionClicks == () ? interaction.tvSubscriptionClicks : check int:fromString(tvSubscriptionClicks) + interaction.tvSubscriptionClicks,
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
                string|() phoneClicks = check contact.properties["iot_devices_visits"].ensureType();
                string|() dealClicks = check contact.properties["mobile_subscription_visits"].ensureType();
                string|() phoneSubscriptionClicks = check contact.properties["smartphone_visits"].ensureType();
                string|() tvSubscriptionClicks = check contact.properties["tv_subscription_visits"].ensureType();
                string|() interactionScore = check contact.properties["interaction_score"].ensureType();

                json interactions = {
                    email: email,
                    dealClicks: dealClicks == () ? 0 : check int:fromString(dealClicks),
                    phoneClicks: phoneClicks == () ? 0 : check int:fromString(phoneClicks),
                    phoneSubscriptionClicks: phoneSubscriptionClicks == () ? 0 : check int:fromString(phoneSubscriptionClicks),
                    tvSubscriptionClicks: tvSubscriptionClicks == () ? 0 : check int:fromString(tvSubscriptionClicks),
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
            string|() phoneClicks = check contacts[0].properties["iot_devices_visits"].ensureType();
            string|() dealClicks = check contacts[0].properties["mobile_subscription_visits"].ensureType();
            string|() phoneSubscriptionClicks = check contacts[0].properties["smartphone_visits"].ensureType();
            string|() tvSubscriptionClicks = check contacts[0].properties["tv_subscription_visits"].ensureType();
            string|() interactionScore = check contacts[0].properties["interaction_score"].ensureType();

            json interactions = {
                email: email,
                dealClicks: dealClicks == () ? 0 : check int:fromString(dealClicks),
                phoneClicks: phoneClicks == () ? 0 : check int:fromString(phoneClicks),
                phoneSubscriptionClicks: phoneSubscriptionClicks == () ? 0 : check int:fromString(phoneSubscriptionClicks),
                tvSubscriptionClicks: tvSubscriptionClicks == () ? 0 : check int:fromString(tvSubscriptionClicks),
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

    if (interaction.dealClicks < 0 || interaction.phoneClicks < 0 ||
     interaction.phoneSubscriptionClicks < 0 || interaction.tvSubscriptionClicks < 0) {
         return error("Bad request.");
     }
}

isolated function calculateScoreIncrement(Interaction interaction) returns int {

    int scoreIncrement = (interaction.dealClicks * eventWeights.get(MOBILE_SUBSCRIPTION_VISITS)) +
        (interaction.phoneClicks * eventWeights.get(IOT_DEVICES_VISITS)) +
        (interaction.tvSubscriptionClicks * eventWeights.get(TV_SUBSCRIPTION_VISITS)) +
        (interaction.phoneSubscriptionClicks * eventWeights.get(SMART_PHONE_VISITS));
    return scoreIncrement; 
}
