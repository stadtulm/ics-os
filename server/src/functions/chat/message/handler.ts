import "source-map-support/register";
import type {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as AWS from "aws-sdk";
import { ulid } from "ulid";

import { formatJSONResponse } from "@libs/apiGateway";

const documentClient = new AWS.DynamoDB.DocumentClient();
const chatroomTableName = process.env.CHATROOM_DB_TABLE;

const message: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const connectionId = event.requestContext.connectionId;
  const chatMessageInfo = JSON.parse(event.body);

  const chatMessageConnectionItem = {
    ...chatMessageInfo,
    PK: `CHAT#${chatMessageInfo.chatroomName}`,
    SK: `MESSAGE#${ulid()}`,
    connectionId,
    timestamp: Date.now(),
  };

  const addChatMessageConnectionResult = await documentClient
    .put({ TableName: chatroomTableName, Item: chatMessageConnectionItem })
    .promise();

  return formatJSONResponse({
    message: `Hello websocket event : ${JSON.stringify(
      addChatMessageConnectionResult
    )}, welcome to the exciting Serverless world!`,
    event,
  });
};

export const main = message;
