import ballerinax/trigger.asgardeo;
import ballerina/http;
import ballerina/log;

configurable asgardeo:ListenerConfig config = ?;

listener http:Listener httpListener = new(8090);
listener asgardeo:Listener webhookListener =  new(config,httpListener);

asgardeo:GenericEvent[10] eventsQueue = [];
int head = 0;
int tail = 0;

service asgardeo:UserOperationService on webhookListener {
  
    remote function onLockUser(asgardeo:GenericEvent event ) returns error? {
      
        eventsQueue[tail] = event;
        tail = tail + 1;
        log:printInfo(string`### onLockUser event received!`);
    }

    remote function onUnlockUser(asgardeo:GenericEvent event ) returns error? {

        eventsQueue[tail] = event;
        tail = tail + 1;
        log:printInfo(string`### onUnlockUser event received!`);
    }

    remote function onUpdateUserCredentials(asgardeo:GenericEvent event ) returns error? {

        log:printInfo(string`### onUpdateUserCredentials event received!`);    
    }

    remote function onDeleteUser(asgardeo:GenericEvent event ) returns error? {

        log:printInfo(string`### onDeleteUser event received!`);    
    }

    remote function onUpdateUserGroup(asgardeo:UserGroupUpdateEvent event ) returns error? {

        log:printInfo(string`### onUpdateUserGroup event received!`);
    }
}

service / on new http:Listener(9090) {

    resource function get nextEvent() returns asgardeo:GenericEvent|http:NotFound? {

        if (tail > 0) {
            return getQueueItem();
        } else {
            http:NotFound nf = {
                body: {
                    message: "No events found in the queue"
                }
            };
            return nf;
        }
    }
}

function getQueueItem() returns asgardeo:GenericEvent {
  
    asgardeo:GenericEvent event = eventsQueue[0];
    foreach int i in 1...tail {
        eventsQueue[0] = eventsQueue[i];
    }
    return event;
}
