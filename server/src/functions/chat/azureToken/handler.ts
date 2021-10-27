import "source-map-support/register";
import type {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as AWS from "aws-sdk";
import { languageCodes as LANGUAGES } from "@libs/languageCodes";
import fetch from "isomorphic-unfetch";

//const MediaFileUri = 'https://s3.amazonaws.com/' + 'bucket-name-where-audio-file-would-be-stored' + '/' + 'AudioFiles/NameOfFile.mp3'
const azureToken: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const eventBody = JSON.parse(event.body);

  // Please create a Microsoft Azure Account, subscribe to the Speech to text service and enter your SpeechKey here:
  const speechKey = "ENTER_YOUR_MICROSOFT_AZURE_SPEECH_TO_TEXT_KEY_HERE";

  const speechRegion = "westeurope"; //process.env.SPEECH_REGION;

  // copied from azure example

  if (!speechKey || !speechRegion) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: `azureToken failed`,
      }),
    };
  } else {
    const tokenResponse = await fetch(
      `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "post",
        headers: {
          "Ocp-Apim-Subscription-Key": speechKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const tokenResponseJson = await tokenResponse.text();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        token: tokenResponseJson,
        region: speechRegion,
      }),
    };
    // try {
    //     const tokenResponse = await axios.post(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, headers);
    //     res.send({ token: tokenResponse.data, region: speechRegion });
    // } catch (err) {
    //     res.status(401).send('There was an error authorizing your speech key.');
    // }
  }
  // copied from azure example

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      message: `azureToken finished`,
    }),
  };
};

export const main = azureToken;
