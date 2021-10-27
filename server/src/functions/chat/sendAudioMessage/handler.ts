import "source-map-support/register";
import type {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as AWS from "aws-sdk";
// import { ulid } from "ulid";

const sendAudioMessage: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const eventBody = event.body;

  const eventBody64BaseDecoded = Buffer.from(eventBody, "base64");

  const AWSS3 = new AWS.S3();
  const saveFile = await AWSS3.putObject({
    Bucket: process.env.CHATROOM_S3_BUCKET,
    Key: `${process.env.CHATROOM_S3_BUCKET_AUDIO_MESSAGES_FOLDER}${event.pathParameters.filename}.webm`,
    ContentType: "audio/webm",
    Body: eventBody64BaseDecoded,
    ACL: "public-read",
  }).promise();

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      message: ``,
      event,
    }),
  };
};

export const main = sendAudioMessage;
