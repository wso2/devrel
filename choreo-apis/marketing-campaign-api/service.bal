
// Marketing campaign API

import ballerina/http;
import ballerinax/googleapis.gmail;
import ballerina/log;
import ballerina/io;

configurable string googleClientId = ?;
configurable string googleClientSecret = ?;
configurable string googleRefreshToken = ?;

const string EMAIL_TEMPLATE_FILE_PATH = "resources/smartphone-email-template.html";

service / on new http:Listener(9090) {

    # Triggers a marketing email for the given email addresses.
    # + emails - Array of email addresses.
    # + return - 200 ok is success, error otherwise.
    resource function post sendMarketingMail(string[] emails) returns error? {
        
        gmail:ConnectionConfig gmailConfig = {
            auth: {
                refreshUrl: gmail:REFRESH_URL,
                refreshToken: googleRefreshToken,
                clientId: googleClientId,
                clientSecret: googleClientSecret
            }
        };

        string emailTemplate = check io:fileReadString(EMAIL_TEMPLATE_FILE_PATH);

        gmail:Client gmailClient = check new (gmailConfig);
        string userId = "me";

        foreach string email in emails {
            gmail:MessageRequest messageRequest = {
                recipient: email,
                subject: "Promotion Alert - Best Smart Phones At a Bargain!",
                messageBody: emailTemplate,
                contentType: gmail:TEXT_HTML,
                sender: "Kfone Marketing <marketing.kfone@gmail.com>"
            };
            gmail:Message _ = check gmailClient->sendMessage(messageRequest, userId = userId);
            log:printInfo(string`### INFO - Marketing email sent successfully for the email: ${email}`);
        }
    }
}
