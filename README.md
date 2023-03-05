# Web Sockets

Basic Socket based chat type application. Based upon: https://github.com/aws-samples/simple-websockets-chat-app

What we are doing is using API Gateway Sockets to communicate with Lambdas with the socket state at the lambda side being kept on Dynamo DB. Doing this eliminates the 
need to have a full blown server up and  running all the time, but still use the socket tech for communication and live web applications.

## Dependencies

AWS-SDK. In this case the sdk is included as a lambda layer. Doing this allows the lambda code to reside directly.... saving tons of upload and even allows editing of the code directly on the lambda. 

The layer was created on Cloud 9 (so it was the correct OS and all you know) https://aws.amazon.com/premiumsupport/knowledge-center/lambda-layer-aws-sdk-latest-version/

#### SDK-v3
SDK is now modular and only the needed modules are installed in the layer. For a list of all the modules, you can go here: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html


## Deployment

Deployed as 3 lambdas with the API gateway having 3 routes. $connect, $disconnect and $default.

The lambda event is passed to the corresponding Lambda as needed. The connect stores the socket id, the disconnect removes it and the default processes the message by reading the event body and broadcasting that to all of the connections (API Gateway knows how to get the message back as Lambda is stateless)


## Emulator (run and test the socket Lambdas locally)
The api-gateway-emulator folder contans code that can be used to emulate the API gateway locally, allowing you to build and run Lambda code locally.
It connects to the socket processing lambdas and has an HTTP, HTTPS, and SOCKET server built in (straigt node no dependencies).
The HTTPS server intecepts the socket responses from the Lambda as they come.
The HTTP server just serves up the test HTML - it is essentially not necessary
The SOCKET server processes socket requests.

Start the emulator with Node socket-api-emulator.js from the api-gateway-emulator folder. See the html file to change the test from local emulator to deployed API gateway code. Change the websocket urlto change from local to deployed.


Note that you will need certs to run the HTTPS server locally. The certs can be created in the api-gateway-emulator/certs folder with the following command (
Run from unix command line, or Git Bash from Windows.):
``` openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem```

Be sure to set the common name to localhost when responding to the questions. The rest of the answers are more or less arbitrary, as we are not creating a signed certificate (a config file could be used here if desired)
```Common Name (e.g. server FQDN or YOUR name) []:localhost```

Note that we can use the unsigned cert in the Node server with the environment variable being set (in the code): ```process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;```

