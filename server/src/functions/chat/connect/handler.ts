import "source-map-support/register";
import type {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as AWS from "aws-sdk";
import { omit } from "ramda";

import { formatJSONResponse } from "@libs/apiGateway";

const documentClient = new AWS.DynamoDB.DocumentClient();
const chatroomTableName = process.env.CHATROOM_DB_TABLE;

const connectChat: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const connectionId = event.requestContext.connectionId;
  const chatUserInfo = omit(["x-api-key"], event.queryStringParameters);

  const chatUserConnectionItem = {
    PK: `CHAT#${chatUserInfo.chatroomName}`,
    SK: `USER#${chatUserInfo.userName}_CID#${connectionId}`,
    connectionId,
    ...chatUserInfo,
    createdAt: new Date().toISOString(),
    timestamp: Date.now(),
  };

  const addChatUserConnectionResult = await documentClient
    .put({ TableName: chatroomTableName, Item: chatUserConnectionItem })
    .promise();

  return formatJSONResponse({
    message: `Hello websocket event : ${JSON.stringify(
      addChatUserConnectionResult
    )}, welcome to the exciting Serverless world!`,
    event,
  });
};

export const main = connectChat;
