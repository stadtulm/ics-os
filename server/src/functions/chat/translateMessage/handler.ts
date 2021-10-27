import "source-map-support/register";
import type {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as AWS from "aws-sdk";
import { languageCodes as LANGUAGES } from "@libs/languageCodes";

const translateService = new AWS.Translate({
  region: process.env.DEPLOYMENT_REGION,
});

async function doTranslate(
  awsTranslateService,
  inputText,
  sourceLanguageCode,
  targetLanguageCode
) {
  var params = {
    Text: inputText,
    SourceLanguageCode: sourceLanguageCode,
    TargetLanguageCode: targetLanguageCode,
  };

  const translateResult = await awsTranslateService
    .translateText(params)
    .promise();
  return translateResult;
}

const polly = new AWS.Polly();

// Generate audio from Polly and check if output is a Buffer
const doSynthesize = async ({
  text,
  languageCode,
  isFemale = true,
}: {
  text: string;
  languageCode: string;
  isFemale: boolean;
}) => {
  // https://docs.aws.amazon.com/polly/latest/dg/voicelist.html
  let voiceId = isFemale
    ? LANGUAGES[languageCode].polly_female_voice
    : LANGUAGES[languageCode].polly_male_voice;

  if (!voiceId) {
    return;
  }
  const params = {
    OutputFormat: "mp3",
    SampleRate: "8000",
    Text: text,
    TextType: "text",
    VoiceId: voiceId,
  };

  return polly.synthesizeSpeech(params).promise();
};

const translateMessage: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const eventBody = JSON.parse(event.body);

  let sourceLanguage: string = LANGUAGES[eventBody.sourceLanguage].translate;
  let destinationLanguage: string =
    LANGUAGES[eventBody.destinationLanguage].translate;

  let translatedText: string;
  let translateResponse;
  if (
    sourceLanguage &&
    destinationLanguage &&
    sourceLanguage !== destinationLanguage
  ) {
    translateResponse = await doTranslate(
      translateService,
      eventBody.sourceText,
      sourceLanguage,
      destinationLanguage
    );
    translatedText = translateResponse.TranslatedText;
  } else {
    translatedText = eventBody.sourceText;
  }

  const pollyResponse = await doSynthesize({
    text: translatedText,
    languageCode: eventBody.destinationLanguage,
    isFemale: eventBody.gender !== "MALE",
  });

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      message: `translateMessage finished`,
      chatMessageId: eventBody.chatMessageId,
      translateResponse,
      audioStream: pollyResponse?.AudioStream,
    }),
  };
};

export const main = translateMessage;
