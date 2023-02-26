# Web Sockets

Basic Socket based chat type application. Based upon: https://github.com/aws-samples/simple-websockets-chat-app

What we are doing is using API Gateway Sockets to communicate with Lambdas with the socket state at the lambda side being kept on Dynamo DB. Doing this eliminates the 
need to have a full blown server up and  running all the time, but still use the socket tech for communication and live web applications.

## Dependencies

AWS-SDK. In this case the sdk is included as a lambda layer. Doing this allows the lambda code to reside directly.... saving tons of upload and even allows editing of the code directly on the lambda. 

The layer was created on Cloud 9 (so it was the correct OS and all you know) https://aws.amazon.com/premiumsupport/knowledge-center/lambda-layer-aws-sdk-latest-version/


## Deployment

Deployed as 3 lambdas with the API gateway having 3 routes. $connect, $disconnect and $default.

The lambda event is passed to the corresponding Lambda as needed. The connect stores the socket id, the disconnect removes it and the default processes the message by reading the event body and broadcasting that to all of the connections (API Gateway knows how to get the message back as Lambda is stateless)
