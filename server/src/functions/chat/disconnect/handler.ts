import "source-map-support/register";
import type {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as AWS from "aws-sdk";
import { splitEvery } from "ramda";

import { formatJSONResponse } from "@libs/apiGateway";

const documentClient = new AWS.DynamoDB.DocumentClient();
const chatroomTableName = process.env.CHATROOM_DB_TABLE;

const disconnectChat: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const connectionId = event.requestContext.connectionId;

  const connectionIdQuery = {
    TableName: chatroomTableName,
    IndexName: "connectionId_idx",
    KeyConditionExpression: "connectionId = :connection_id",
    ExpressionAttributeValues: { ":connection_id": connectionId },
  };

  const connectionIdQueryResult = await documentClient
    .query(connectionIdQuery)
    .promise();

  const connectionIdItemsDeleteParams = prepareItemDeletion(
    connectionIdQueryResult.Items
  );

  const chunkedConnectionIdItemsDeleteParams = splitEvery(
    20,
    connectionIdItemsDeleteParams
  );

  const promises = chunkedConnectionIdItemsDeleteParams.map(async function (
    chunk
  ) {
    const params = { RequestItems: { [chatroomTableName]: chunk } };
    const res = await documentClient.batchWrite(params).promise();
    return res;
  });

  const batchDeleteChunkedItemsResult = await Promise.all(promises);

  return formatJSONResponse({
    message: `Hello websocket event : ${JSON.stringify(
      batchDeleteChunkedItemsResult
    )}, welcome to the exciting Serverless world!`,
    event,
  });
};

function prepareItemDeletion(items) {
  const deleteParams = items.map((i) => ({
    DeleteRequest: {
      Key: {
        PK: i.PK,
        SK: i.SK,
      },
    },
  }));

  return deleteParams;
}

export const main = disconnectChat;
