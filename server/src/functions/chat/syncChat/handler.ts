import "source-map-support/register";
import type { DynamoDBStreamHandler, DynamoDBStreamEvent } from "aws-lambda";
import * as AWS from "aws-sdk";

const documentClient = new AWS.DynamoDB.DocumentClient();
const chatroomTableName = process.env.CHATROOM_DB_TABLE;

const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
  apiVersion: "2018-11-29",
  endpoint: process.env.websocketApiUrl,
});

const syncChat: DynamoDBStreamHandler = async (
  event: DynamoDBStreamEvent
): Promise<void> => {
  const dynamoDBStreamFirstRecord = event.Records[0];
  const dynamoDBStreamFirstRecordDynamoDBKeys = event.Records[0].dynamodb.Keys;

  const { Items: chatConnectionIdItems } = await documentClient
    .query({
      TableName: chatroomTableName,
      KeyConditionExpression: "PK = :PK and begins_with(SK, :SK)",
      ExpressionAttributeValues: {
        ":PK": dynamoDBStreamFirstRecordDynamoDBKeys.PK.S,
        ":SK": "USER#",
      },
    })
    .promise();

  await Promise.all(
    chatConnectionIdItems.map(async (connectionIdItem) => {
      await apiGatewayManagementApi
        .postToConnection({
          ConnectionId: connectionIdItem.connectionId,
          Data: JSON.stringify(dynamoDBStreamFirstRecord),
        })
        .promise();
    })
  );
};

export const main = syncChat;
