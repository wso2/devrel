
// Usage Data API

import ballerina/http;
import ballerinax/mongodb;
import ballerina/log;
import ballerina/random;

configurable string mongoUsername = ?;
configurable string mongoPassword = ?;
configurable string mongoDatabase = ?;
configurable string mongoCollection = ?;
configurable string additionalPurchasesCollection = "additionalPurchases";
configurable string asgardeoClientID = ?;
configurable string asgardeoClientSecret = ?;
const string asgardeoBaseUrl = "https://api.asgardeo.io/t/kfone/";
const string scimEndpoint = "scim2/Users";

configurable boolean isDebugEnabled = false;

enum ConnectionType {
    prepaid = "prepaid",
    postpaid = "postpaid"
}

type UsageDO record {
    string userId;
    int allocatedMinutesUsage;
    int allocatedDataUsage;
    int month;
    int year;
    int subscriptionId;
};

type AdditionalPurchaseDO record {
    string userId;
    int month;
    int year;
    int additionalData;
    int additionalMinutes;
    int additionalDataUsage;
    int additionalMinutesUsage;
};

type UsageResponsePayload record {
    string userId;
    SubscriptionDO subscription;
    UsageResponseDO[] usage;
};

type UsageResponseDO record {
    int month;
    int year;
    int allocatedMinutesUsage;
    int allocatedDataUsage;
    AdditionalPurchaseResponseDO[] additionalPurchases;
};

type AdditionalPurchaseResponseDO record {
    int additionalData;
    int additionalMinutes;
    int additionalDataUsage;
    int additionalMinutesUsage;
};

type UsageCreate record {
    string userId;
    int month;
    int year;
};

type SubscriptionDO record {
    int id;
    // Price should be decimal. But getting a conversion error when constructing object from mongo response.
    int price;
    ConnectionType connectionType;
    int freeCallMinutes;
    int freeDataGB;
    string name;
};

string dbUrl = "mongodb+srv://" + mongoUsername + ":" + mongoPassword + "@cluster0.phgf024.mongodb.net/?retryWrites=true&w=majority";

mongodb:ConnectionConfig mongoConfig = {
    options: {url: dbUrl, sslEnabled: false, serverSelectionTimeout: 5000}
};

service / on new http:Listener(9090) {

    resource function get subscriptions() returns http:Ok|http:NotFound|http:InternalServerError|error {

        SubscriptionDO[]|error subscriptions = check getAllSubscriptions();
        if subscriptions is error {
            http:InternalServerError e = {
                body: "Something went wrong!"
            };
            return e;
        } else if subscriptions == [] {
            http:NotFound nf = {
                body: "Couldn't find any subscriptions."
            };
            return nf;
        } else {
            http:Ok ok = {
                body: subscriptions
            };
            return ok;
        }
    }

    resource function get packageRecommendation(string userId) returns http:Ok|http:NotFound|http:InternalServerError|error {

        if userId == "95828fa3-25a8-4a67-9927-5f41e8587c5f" || 
            userId == "50219c29-d575-4b93-a8ff-3cab99fe34b1" {
                
            SubscriptionDO sub = check getSubscriptionInfo(2);
            http:Ok ok = { 
                body: {
                    status: "Recommendation Found",
                    recommendation: sub
                } 
            };
            return ok;
        } else {
            http:Ok ok = { 
                body: {
                    status: "Recommendation Not Found"
                }
            };
            return ok;
        }
    }

    resource function get getUsageData(string userId) returns http:Ok|http:NotFound|http:InternalServerError {

        UsageDO[]|error usageData = getUsageData(userId);
        AdditionalPurchaseDO[]|error additionalPurchasesData = getAdditionalPurchasesData(userId);

        if (usageData is error) {
            log:printError("Usage data cannot be fetched.");
            http:InternalServerError ise = { body: usageData.message() };
            return ise;
        } else if (usageData.length() == 0) {
            http:NotFound notFoundError = { body: "Usage data not found for the user: " + userId};
            return notFoundError;
        }
        if !(usageData is error) && !(additionalPurchasesData is error) {
            SubscriptionDO|error subscriptionInfo = getSubscriptionInfo(usageData[0].subscriptionId);
            if (subscriptionInfo is error) {
                log:printError(subscriptionInfo.message());
                http:InternalServerError ise = { body: "Subscription info cannot be fetched." };
                return ise;
            } else {
                UsageResponsePayload usagePayload = buildUsagePayload(usageData, subscriptionInfo, additionalPurchasesData);
                http:Ok ok = { body: usagePayload };
                return ok;
            }
        }
        http:InternalServerError ise = {};
        return ise;
    }

    resource function put updateUsageData(string userId, int? callMinutesUsed, int? mobileDataUsed) returns string|error {
        
        // Method outdated! Mongo Update call is also failing.

        UsageDO[]|null|error usageData = getUsageData(userId);
        int newCallMinutesUsed;
        int newMobileDataUsed;
        if (usageData is UsageDO[]) {
            SubscriptionDO subscriptionDO = check getSubscriptionInfo(usageData[0].subscriptionId);
            if (callMinutesUsed == null) {
                newCallMinutesUsed = check random:createIntInRange(usageData[0].allocatedMinutesUsage, subscriptionDO.freeCallMinutes + 1);
            } else {
                newCallMinutesUsed = callMinutesUsed;
            }
            if (mobileDataUsed == null) {
                newMobileDataUsed = check random:createIntInRange(usageData[0].allocatedDataUsage, subscriptionDO.freeDataGB + 1);
            } else {
                newMobileDataUsed = mobileDataUsed;
            }
            error? userData = updateUsageData(userId, newCallMinutesUsed, newMobileDataUsed);
            if (userData is error) {
                log:printError(userData.toString());
                return userData;
            }
            return "Success";
        } else {
            return "User not found.";
        }
    }

    resource function post createUsageData(@http:Payload UsageCreate usageCreatePayload) returns http:Ok|http:NotFound|http:InternalServerError|http:Conflict|error {

        // Check if user exists in Asgardeo
        string scimUserPath = scimEndpoint + "/" + usageCreatePayload.userId;
        http:Client asgardeoClient = check new (asgardeoBaseUrl,
            auth = {
                tokenUrl: "https://api.asgardeo.io/t/kfone/oauth2/token",
                clientId: asgardeoClientID,
                clientSecret: asgardeoClientSecret,
                scopes: ["internal_user_mgt_view"]
            }
        );

        http:Response userResponse = check asgardeoClient->get(scimUserPath);
        if (userResponse.statusCode == 200) {
            if (isDebugEnabled) {
                log:printDebug("User exists");
            }
            error? userData = addUsageData(usageCreatePayload);
            if userData is error {
                if userData.message() == "409" {
                    http:Conflict c = { body: "Usage data entry already exists." };
                    return c;
                } else {
                    http:InternalServerError ise = { body: userData.toString() };
                    return ise;
                }
            }
            http:Ok ok = { body: "Success"};
            return ok;
        } else {
            log:printError(userResponse.statusCode.toString());
            if userResponse.statusCode == 404 {
                http:NotFound nfe = { body: "User not found." };
                return nfe;
            } else {
                http:InternalServerError ise = {body: userResponse.statusCode};
                return ise;
            }
        }
    }

    resource function post addAdditionalPurchase(@http:Payload AdditionalPurchaseDO additionalPurchase) returns http:Ok|http:NotFound|http:InternalServerError|http:Conflict|error {

        // Check if user exists in Asgardeo
        string scimUserPath = scimEndpoint + "/" + additionalPurchase.userId;
        http:Client AsgardeoUserEP = check new (asgardeoBaseUrl,
            auth = {
                tokenUrl: "https://api.asgardeo.io/t/kfone/oauth2/token",
                clientId: asgardeoClientID,
                clientSecret: asgardeoClientSecret,
                scopes: ["internal_user_mgt_view"]
            }
        );

        http:Response userResponse = check AsgardeoUserEP->get(scimUserPath);
        if (userResponse.statusCode == 200) {
            if (isDebugEnabled) {
                log:printDebug("User exists");
            }
            error? userData = addAdditionalPurchaseData(additionalPurchase);
            if userData is error {
                if userData.message() == "409" {
                    http:Conflict c = { body: "Usage data entry already exists." };
                    return c;
                } else {
                    http:InternalServerError ise = { body: userData.toString() };
                    return ise;
                }
            }
            http:Ok ok = { body: "Success"};
            return ok;
        } else {
            log:printError(userResponse.statusCode.toString());
            if userResponse.statusCode == 404 {
                http:NotFound nfe = { body: "User not found." };
                return nfe;
            } else {
                http:InternalServerError ise = {body: userResponse.statusCode};
                return ise;
            }
        }
    }
}

function getUsageData(string userId) returns UsageDO[]|error {

    mongodb:Client mongoClient = checkpanic new (mongoConfig, mongoDatabase);

    map<json> queryString = {"userId": userId };
    stream<UsageDO, error?> result = check mongoClient->find(mongoCollection, (), queryString);
    UsageDO[] usageStat = [];
    int i = 0;
    check result.forEach(function(UsageDO usageDO) {
        // log:printInfo(usageDO.toString());
        usageStat[i] = usageDO;
        i = i + 1;
    });
    // Possible memory leaks in case of prior errors. Try with resources pattern needs to be followed.
    mongoClient->close();
    return usageStat;
}

function getAdditionalPurchasesData(string userId) returns AdditionalPurchaseDO[]|error {

    mongodb:Client mongoClient = checkpanic new (mongoConfig, mongoDatabase);

    map<json> queryString = {"userId": userId };
    stream<AdditionalPurchaseDO, error?> result = check mongoClient->find(additionalPurchasesCollection, (), queryString);
    AdditionalPurchaseDO[] additionalPurchases = [];
    int i = 0;
    check result.forEach(function(AdditionalPurchaseDO additionalPurchaseDO) {
        // log:printInfo(usageDO.toString());
        additionalPurchases[i] = additionalPurchaseDO;
        i = i + 1;
    });
    // Possible memory leaks in case of prior errors. Try with resources pattern needs to be followed.
    mongoClient->close();
    return additionalPurchases;
}

function getAllSubscriptions() returns SubscriptionDO[]|error {

    mongodb:Client mongoClient = checkpanic new (mongoConfig, mongoDatabase);

    map<json> queryString = {};
    stream<SubscriptionDO, error?>|mongodb:Error result = check mongoClient->find("subscriptions", (), queryString);

    if (result is mongodb:DatabaseError || result is mongodb:ApplicationError || result is error) {
        return error("500");
    }

    SubscriptionDO[] subscriptions = [];
    check result.forEach(function(SubscriptionDO subscriptionDO) {
        SubscriptionDO sub = {
            id: subscriptionDO.id,
            price: subscriptionDO.price,
            connectionType: subscriptionDO.connectionType,
            freeCallMinutes: subscriptionDO.freeCallMinutes,
            freeDataGB: subscriptionDO.freeDataGB,
            name: subscriptionDO.name
        };
        subscriptions[subscriptions.length()] = sub;
    });
    // Possible memory leaks in case of prior errors. Try with resources pattern needs to be followed.
    mongoClient->close();
    return subscriptions;
}

function getSubscriptionInfo(int subscriptionId) returns SubscriptionDO|error {

    mongodb:Client mongoClient = checkpanic new (mongoConfig, mongoDatabase);

    map<json> queryString = {"id": subscriptionId };
    stream<SubscriptionDO, error?> result = check mongoClient->find("subscriptions", (), queryString);
    SubscriptionDO|null subscriptionInfo = null;
    check result.forEach(function(SubscriptionDO subscriptionDO) {
        subscriptionInfo = subscriptionDO;
    });
    // Possible memory leaks in case of prior errors. Try with resources pattern needs to be followed.
    mongoClient->close();
    if (subscriptionInfo == null) {
        return error("500");
    }
    return subscriptionInfo;
}

function addUsageData(UsageCreate usageCreateData) returns error? {

    mongodb:Client mongoClient = checkpanic new (mongoConfig, mongoDatabase);

    int callMinutesUsed = check random:createIntInRange(0, 50);
    int mobileDataUsed = check random:createIntInRange(0, 500);
    int subscriptionId = check random:createIntInRange(1, 5);

    map<json> data = {
        "userId": usageCreateData.userId, 
        "month": usageCreateData.month, 
        "year": usageCreateData.year, 
        "allocatedMinutesUsage": callMinutesUsed, 
        "allocatedDataUsage": mobileDataUsed, 
        "subscriptionId" : subscriptionId 
    };
    mongodb:Error? mongoResponse = mongoClient->insert(data, mongoCollection);
    mongoClient->close();
    if (mongoResponse is mongodb:DatabaseError) {
        // TODO: Need to check error response and handle duplicate event accordingly.
        return error("409");
    } else if (mongoResponse is mongodb:ApplicationError || mongoResponse is error) {
        return error("500");
    }
}

function addAdditionalPurchaseData(AdditionalPurchaseDO additionalPurchase) returns error? {

    mongodb:Client mongoClient = checkpanic new (mongoConfig, mongoDatabase);

    map<json> data = {
        "userId": additionalPurchase.userId, 
        "month": additionalPurchase.month, 
        "year": additionalPurchase.year, 
        "additionalMinutes": additionalPurchase.additionalMinutes, 
        "additionalData": additionalPurchase.additionalData 
    };
    // TODO handle errors
    mongodb:Error? mongoResponse = check mongoClient->insert(data, additionalPurchasesCollection);
    mongoClient->close();
}

function updateUsageData(string userId, int callMinutesUsed, int mobileDataUsed) returns error? {

    mongodb:Client mongoClient = checkpanic new (mongoConfig, mongoDatabase);

    // map<json> replaceFilter = { "userId": userId.toString() };
    // map<json> replaceDoc = {"userId": userId.toString(), "callMinutesUsed": callMinutesUsed, "mobileDataUsed": mobileDataUsed };
    // int response = check mongoClient->update(replaceDoc, mongoCollection, (), replaceFilter, false);
    log:printInfo("------------------ Updating Data with another filter -------------------");
    map<json> replaceFilter2 = { "name": "Mongodb" };
    map<json> replaceDoc2 = { "name": "Mongodb", "version": "0.92.3", "type" : "Database" };

    int response = check mongoClient->update(replaceDoc2, mongoCollection, (), replaceFilter2, true);
    // Possible memory leaks in case of prior errors. Try with resources pattern needs to be followed.
    mongoClient->close();
    if (response == 0 ) {
        log:printError("Error updating usage data");
        return error("500");
    }
}

function buildUsagePayload(UsageDO[] usageDOs, SubscriptionDO subscriptionDO, AdditionalPurchaseDO[] additionalPurchaseDOs) returns UsageResponsePayload {

    UsageResponsePayload usagePayload = {
        userId: usageDOs[0].userId,
        subscription: {
            id: subscriptionDO.id,
            connectionType: subscriptionDO.connectionType,
            price: subscriptionDO.price,
            freeCallMinutes: subscriptionDO.freeCallMinutes,
            freeDataGB: subscriptionDO.freeDataGB,
            name: subscriptionDO.name
        },
        usage: buildUsageList(usageDOs, additionalPurchaseDOs)
    };
    return usagePayload;        
}

function buildUsageList(UsageDO[] usageDOs, AdditionalPurchaseDO[] purchasesDOs) returns UsageResponseDO[] {

    UsageResponseDO[] usageResponseList = [];
    foreach int i in 0...usageDOs.length()-1 {
        UsageResponseDO usage = {
            month: usageDOs[i].month,
            year: usageDOs[i].year,
            allocatedDataUsage: usageDOs[i].allocatedDataUsage,
            allocatedMinutesUsage: usageDOs[i].allocatedMinutesUsage,
            additionalPurchases: buildPurchasesList(usageDOs[i].month, usageDOs[i].year, purchasesDOs)
        };
        usageResponseList[usageResponseList.length()] = usage;
    }
    return usageResponseList;
}

function buildPurchasesList(int month, int year, AdditionalPurchaseDO[] purchasesDOs) returns AdditionalPurchaseResponseDO[] {

    AdditionalPurchaseResponseDO[] purchaseResponseList = [];
    foreach int i in 0...purchasesDOs.length()-1 {
        if (purchasesDOs[i].month == month && purchasesDOs[i].year == year) {
            AdditionalPurchaseResponseDO purchase = {
                additionalData: purchasesDOs[i].additionalData,
                additionalMinutes: purchasesDOs[i].additionalMinutes,
                additionalMinutesUsage: purchasesDOs[i].additionalMinutesUsage,
                additionalDataUsage: purchasesDOs[i].additionalDataUsage
            };
            purchaseResponseList[purchaseResponseList.length()] = purchase;
        }
    }
    return purchaseResponseList;
}
