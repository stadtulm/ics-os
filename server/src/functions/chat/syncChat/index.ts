import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    // stage: "${self:custom.deployment.stage}",
    // region: "${self:provider.region}",
    // FAILED: websocketApiUrl2: { Ref: "ServiceEndpointWebsocket" },
    // FAILED: websocketApiUrl3: { "Fn::GetAtt": "ServiceEndpointWebsocket" },
    // FAILED: websocketApiUrl4: "!GetAtt ServiceEndpointWebsocket",
    websocketApiUrl: {
      "Fn::Join": [
        "",
        [
          { Ref: "WebsocketsApi" },
          ".execute-api.",
          "${self:provider.region}",
          ".amazonaws.com/",
          "${self:custom.deployment.stage}",
        ],
      ],
    },
  },
  events: [
    {
      stream: {
        type: "dynamodb",
        arn: { "Fn::GetAtt": ["ChatroomDynamoDBTable", "StreamArn"] },
      },
    },
  ],
};
