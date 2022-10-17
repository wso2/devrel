import ballerina/log;
import ballerinax/mongodb;

# mongodb+srv://wso2_devrel:<password>@cluster0.qjddnby.mongodb.net/?retryWrites=true&w=majority
# ?serverSelectionTryOnce=false&serverSelectionTimeoutMS=15000&w=majority
// configurable string host = "serverlessinstance0.qufbu.mongodb.net";
configurable string host = "serverlessinstance0-shard-00-01.qufbu.mongodb.net";
// configurable string host = "ac-zdwgypi-shard-00-01.qjddnby.mongodb.net";
configurable int port = 27017;
configurable string username = "wso2_devrel";
configurable string password = "rBbliiFDlfoZhnf3";
configurable string database = "test_db";
configurable string collection = "docs";

public function main() returns error? {

    mongodb:ConnectionConfig mongoConfig = {
        host: host,
        port: port,
        username: username,
        password: password,
        options: {
            sslEnabled: false,
            authSource: username,
            serverSelectionTimeout: 5 * 1000,
            socketTimeout: 60 * 1000,
            connectionTimeout: 60 * 1000
            retryWrites: true,
            writeConcern: "majority"
        }
    };

    mongodb:Client mongoClient = check new (mongoConfig, database);

    log:printInfo("------------------ Get Data -------------------");
    string[]|error names = mongoClient->getDatabasesNames();

    if names is error {
        log:printError("db", names);
    }
    names = mongoClient->getCollectionNames(database);
    if names is error {
        log:printError("col", names);
    }
    int|error count = mongoClient->countDocuments(collection, (), ());

    if count is error {
        log:printError("count", count);
    }
    // log:printInfo(names.toJsonString());
    // map<json> doc1 = {"name": "Gmail", "version": "0.99.1", "type": "Service"};
    // map<json> doc2 = {"name": "Salesforce", "version": "0.99.5", "type": "Enterprise"};
    // map<json> doc3 = {"name": "Mongodb", "version": "0.89.5", "type": "DataBase"};

    // log:printInfo("------------------ Inserting Data -------------------");
    // check mongoClient->insert(doc1, collection);
    // check mongoClient->insert(doc2, collection);
    // check mongoClient->insert(doc3, collection);
    
    mongoClient->close();
}
