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

  const apigwManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    region: 'us-east-1',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });

  const postData = event.body;

  const postCalls = connectionData.Items.map(async ({ connectionId }) => {
    try {
      await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: postData });
      console.log(`Lambda socket processing message to  ${connectionId}`);
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await ddb.delete({ TableName: TABLE_NAME, Key: { connectionId } });
      } else {
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

