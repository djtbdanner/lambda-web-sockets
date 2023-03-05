const {
  ApiGatewayManagementApi
} = require("@aws-sdk/client-apigatewaymanagementapi"),
  {
    DynamoDBDocument
  } = require("@aws-sdk/lib-dynamodb"),
  {
    DynamoDB
  } = require("@aws-sdk/client-dynamodb");
const ddb = DynamoDBDocument.from(new DynamoDB({ apiVersion: '2012-08-10', region: 'us-east-1' }));

const TABLE_NAME = 'web-socket-connections';

exports.handler = async event => {
  let connectionData;

  try {
    connectionData = await ddb.scan({ TableName: TABLE_NAME, ProjectionExpression: 'connectionId' });
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  const endpoint = getEndpoint(event);
  const apigwManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    region: 'us-east-1',
    endpoint
  });


  const postData = event.body;

  const postCalls = connectionData.Items.map(async ({ connectionId }) => {
    try {
      await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: postData });
      console.log(`Lambda socket processing message to  ${connectionId}`);
    } catch (e) {
      if (isMaybeStaleConnection(e)) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await ddb.delete({ TableName: TABLE_NAME, Key: { connectionId } });
      } else {
        console.log(`Error responding to API Gateway: ${e}, ${e.name}, StatusCode: ${e.statusCode}, Stack: ${e.stack}`);
        throw e;
      }
    }
  });

  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};

function getEndpoint(event) {
  let endpoint = event.requestContext.domainName + '/' + event.requestContext.stage;
  if (!endpoint.toLowerCase().startsWith('http')) {
    console.log(`Adding protocol to endpoint ${endpoint}`);
    endpoint = `https:\\${endpoint}`;
  }
  return endpoint;
}

function isMaybeStaleConnection(e) {
  if (e) {
    return e.statusCode === 410 || e.name === "GoneException" || e.name === "NotFoundException" || e.name === "BadRequestException" || e.name === "410";
  }

  return false
}