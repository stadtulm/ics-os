// import schema from "./schema";
import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  memorySize: 512,
  timeout: 30,
  events: [
    {
      s3: {
        bucket: "${self:custom.resources.s3.chatroomS3Bucket}",
        event: "s3:ObjectCreated:*",
        existing: true,
        rules: [
          {
            prefix: "${self:custom.resources.s3.audioMessageFolder}",
          },
          {
            suffix: "${self:custom.resources.s3.audioMessageSuffix}",
          },
        ],
      },
    },
  ],
};
