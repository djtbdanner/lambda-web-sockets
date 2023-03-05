const {
        DynamoDBDocument
      } = require("@aws-sdk/lib-dynamodb"),
      {
        DynamoDB
      } = require("@aws-sdk/client-dynamodb");
const ddb = DynamoDBDocument.from(new DynamoDB({ apiVersion: '2012-08-10', region: 'us-east-1' }));
const TABLE_NAME ='web-socket-connections';

exports.handler = async event => {
  // console.log(JSON.stringify(event));    
  const deleteParams = {
    TableName: TABLE_NAME,
    Key: {
      connectionId: event.requestContext.connectionId
    }
  };

  try {
    await ddb.delete(deleteParams);
  } catch (err) {
    console.log(`Failed to disconnect ${err}`);
    return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(err) };
  }

  console.log(`Disconnected ${event.requestContext.connectionId}`);
  return { statusCode: 200, body: 'Disconnected.' };
};
