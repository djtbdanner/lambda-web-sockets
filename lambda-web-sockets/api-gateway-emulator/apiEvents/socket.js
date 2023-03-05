
exports.socketEvent = (requestId, body) => {

    return {
        "requestContext": {
            "routeKey": "$default",
            "messageId": "A97SDdYpoAMCKEw=",
            "eventType": "MESSAGE",
            "extendedRequestId": "A97SDFO_oAMFZEQ=",
            "requestTime": "26/Feb/2023:22:10:33 +0000",
            "messageDirection": "IN",
            "stage": "",
            "connectedAt": 1677449194040,
            "requestTimeEpoch": 1677449433688,
            "identity": {
                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
                "sourceIp": "162.245.174.22"
            },
            requestId,
            "domainName": "https://localhost",
            "connectionId": "A96sncVQoAMCKEw=",
            "apiId": "eji3awbnsh"
        },
        body,
        "isBase64Encoded": false
    };
}