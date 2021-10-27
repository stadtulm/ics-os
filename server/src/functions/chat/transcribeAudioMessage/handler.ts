import "source-map-support/register";
import type { S3Handler, S3CreateEvent } from "aws-lambda";
import * as AWS from "aws-sdk";

const transcribeService = new AWS.TranscribeService({
  region: process.env.DEPLOYMENT_REGION,
});

const transcribeAudioMessage: S3Handler = async (
  event: S3CreateEvent
): Promise<void> => {
  const eventFileName = event.Records[0]?.s3.object.key.split("/")[1];
  const eventFileNameParts: any = eventFileName
    .split(".")[0]
    .split("__")
    .reduce((result, current) => {
      const [key, value] = current.split("_");
      return { ...result, [key]: value };
    }, {});

  const audioSourceMediaUri = `https://${event.Records[0]?.s3.bucket.name}.s3.${process.env.DEPLOYMENT_REGION}.amazonaws.com/${event.Records[0]?.s3.object.key}`;

  const transcribeParams: AWS.TranscribeService.StartTranscriptionJobRequest = {
    TranscriptionJobName: `${event.Records[0]?.s3.object.key.split("/")[1]}`,
    Media: { MediaFileUri: audioSourceMediaUri },
    MediaFormat: "webm",
    OutputBucketName: `${event.Records[0]?.s3.bucket.name}`,
    OutputKey: "audio-transcriptions/",
    LanguageCode: eventFileNameParts.LANG,
  };

  await transcribeService.startTranscriptionJob(transcribeParams).promise();
};

export const main = transcribeAudioMessage;
