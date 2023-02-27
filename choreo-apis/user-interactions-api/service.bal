
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
    PHONE_CLICK = "PHONE_CLICK",
    DEAL_CLICK = "DEAL_CLICK",
    PHONE_SUBSCRIPTION_CLICK = "PHONE_SUBSCRIPTION_CLICK",
    TV_SUBSCRIPTION_CLICK = "TV_SUBSCRIPTION_CLICK"
}

const map<int> eventWeights = {
    PHONE_CLICK: 1,
    DEAL_CLICK: 2,
    PHONE_SUBSCRIPTION_CLICK: 3,
    TV_SUBSCRIPTION_CLICK: 2
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
            string|() phoneClicks = check contacts[0].properties["shop_phone_clicks"].ensureType();
            string|() dealClicks = check contacts[0].properties["deal_clicks"].ensureType();
            string|() phoneSubscriptionClicks = check contacts[0].properties["phone_subscription_clicks"].ensureType();
            string|() tvSubscriptionClicks = check contacts[0].properties["tv_subscription_clicks"].ensureType();
            string|() interactionScore = check contacts[0].properties["interaction_score"].ensureType();

            int scoreIncrement = calculateScoreIncrement(interaction);
            // Update contact.
            contact:SimplePublicObjectInput updatePayload = {
                "properties": {
                    "shop_phone_clicks" : phoneClicks == () ? interaction.phoneClicks : check int:fromString(phoneClicks) + interaction.phoneClicks,
                    "deal_clicks" : dealClicks == () ? interaction.dealClicks : check int:fromString(dealClicks) + interaction.dealClicks,
                    "phone_subscription_clicks": phoneSubscriptionClicks == () ? interaction.phoneSubscriptionClicks : check int:fromString(phoneSubscriptionClicks) + interaction.phoneSubscriptionClicks,
                    "tv_subscription_clicks": tvSubscriptionClicks == () ? interaction.tvSubscriptionClicks : check int:fromString(tvSubscriptionClicks) + interaction.tvSubscriptionClicks,
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
    # + category - One of valid category ["shop_phone_clicks", "deal_clicks", "phone_subscription_clicks", "tv_subscription_clicks"]
    # + return - Returns a list of users that have interactions with the given category
    resource function get interactionsByCategory(string category) returns http:Ok|http:NotFound|http:BadRequest|error {

        if (category != "shop_phone_clicks" && category != "deal_clicks" && 
            category != "phone_subscription_clicks" && category != "tv_subscription_clicks") {
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
                string|() phoneClicks = check contact.properties["shop_phone_clicks"].ensureType();
                string|() dealClicks = check contact.properties["deal_clicks"].ensureType();
                string|() phoneSubscriptionClicks = check contact.properties["phone_subscription_clicks"].ensureType();
                string|() tvSubscriptionClicks = check contact.properties["tv_subscription_clicks"].ensureType();
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
            string|() phoneClicks = check contacts[0].properties["shop_phone_clicks"].ensureType();
            string|() dealClicks = check contacts[0].properties["deal_clicks"].ensureType();
            string|() phoneSubscriptionClicks = check contacts[0].properties["phone_subscription_clicks"].ensureType();
            string|() tvSubscriptionClicks = check contacts[0].properties["tv_subscription_clicks"].ensureType();
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
            "shop_phone_clicks", "deal_clicks", "phone_subscription_clicks", "tv_subscription_clicks", "interaction_score"
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
            "email", "shop_phone_clicks", "deal_clicks", "phone_subscription_clicks", "tv_subscription_clicks", "interaction_score"
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

    int scoreIncrement = (interaction.dealClicks * eventWeights.get(DEAL_CLICK)) +
        (interaction.phoneClicks * eventWeights.get(PHONE_CLICK)) +
        (interaction.tvSubscriptionClicks * eventWeights.get(TV_SUBSCRIPTION_CLICK)) +
        (interaction.phoneSubscriptionClicks * eventWeights.get(PHONE_SUBSCRIPTION_CLICK));
    return scoreIncrement; 
}
