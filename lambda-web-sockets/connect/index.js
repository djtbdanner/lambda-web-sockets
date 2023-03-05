const {
        DynamoDBDocument
      } = require("@aws-sdk/lib-dynamodb"),
      {
        DynamoDB
      } = require("@aws-sdk/client-dynamodb");
const fs = require('fs');
const ddb = DynamoDBDocument.from(new DynamoDB({ apiVersion: '2012-08-10', region: 'us-east-1' }));

const TABLE_NAME ='web-socket-connections';


exports.handler = async event => {
  
  // console.log(`EVENT: ${JSON.stringify(event)}`);
  const putParams = {
    TableName: TABLE_NAME,
    Item: {
      connectionId: event.requestContext.connectionId
    }
  };

  try {
    await ddb.put(putParams);
  } catch (err) {
    return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(err) };
  }
  console.log(`Connected ${event.requestContext.connectionId}`);
  return { statusCode: 200, body: 'Connected.' };
};
