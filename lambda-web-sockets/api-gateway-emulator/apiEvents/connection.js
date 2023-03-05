
exports.connectionEvent = (requestId, routeKey, eventType, disconnectStatusCode) => {
    
    // const domainName = req.headers.host.split(":")[0];
    // const ip = req.connection.remoteAddress;
    domainName = "localhost"
    ip = "127.0.0.1"
    port = "443";

    return {
        "headers": {
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            "Host": domainName,
            "Origin": "null",
            "Pragma": "no-cache",
            "Sec-WebSocket-Extensions": "permessage-deflate; client_max_window_bits",
            "Sec-WebSocket-Key": "sf0ygzpbhi+xetujlMU6Zw==",
            "Sec-WebSocket-Version": "13",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
            "X-Amzn-Trace-Id": "Root=1-63fbd8c7-0342b7f8197087c4690b8148",
            "X-Forwarded-For": ip,
            "X-Forwarded-Port": port,
            "X-Forwarded-Proto": "https"
        },
        "multiValueHeaders": {
            "Accept-Encoding": [
                "gzip, deflate, br"
            ],
            "Accept-Language": [
                "en-US,en;q=0.9"
            ],
            "Cache-Control": [
                "no-cache"
            ],
            "Host": [
                "localhost"
            ],
            "Origin": [
                "null"
            ],
            "Pragma": [
                "no-cache"
            ],
            "Sec-WebSocket-Extensions": [
                "permessage-deflate; client_max_window_bits"
            ],
            "Sec-WebSocket-Key": [
                "sf0ygzpbhi+xetujlMU6Zw=="
            ],
            "Sec-WebSocket-Version": [
                "13"
            ],
            "User-Agent": [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
            ],
            "X-Amzn-Trace-Id": [
                "Root=1-63fbd8c7-0342b7f8197087c4690b8148"
            ],
            "X-Forwarded-For": [
                ip
            ],
            "X-Forwarded-Port": [
                port
            ],
            "X-Forwarded-Proto": [
                "https"
            ]
        },
        "requestContext": {
            routeKey,
            eventType,
            disconnectStatusCode,
            "extendedRequestId": requestId,
            "requestTime": new Date().toISOString(),
            "messageDirection": "IN",
            "stage": "production",
            "connectedAt": Date.now(),
            "requestTimeEpoch": Date.now(),
            "identity": {
                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
                "sourceIp": "162.245.174.22"
            },
            requestId,
            domainName,
            "connectionId": requestId,
            "apiId": "eji3awbnsh"
        },
        "isBase64Encoded": false
    };
}