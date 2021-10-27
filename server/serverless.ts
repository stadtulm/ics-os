import type { AWS } from "@serverless/typescript";

import {
  hello,
  connectChat,
  disconnectChat,
  message,
  translateMessage,
  azureToken,
  syncChat,
  sendAudioMessage,
  transcribeAudioMessage,
} from "@functions/index";

const serverlessConfiguration: AWS = {
  org: "1tmsolutions",
  app: "intercultural-communication-space",
  service: "chat",
  frameworkVersion: "2",
  custom: {
    apiKeys: {
      sendAudioMessageApiKey: {
        name: "SendAudioMessageApiKey-${self:provider.stage}",
      },
    },
    functions: {},
    resources: {
      chatroomDb: "ChatroomDB-${self:provider.stage}",
      s3: {
        chatroomS3Bucket: "chatroom-s3-bucket-${self:provider.stage}",
        audioMessageFolder: "audio-messages/",
        audioMessageSuffix: "webm",
      },
    },
    deployment: {
      stage: "${opt:stage, 'development'}",
      region: "${opt:region, 'eu-central-1'}",
    },
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },

  plugins: ["serverless-webpack"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-central-1",
    apiGateway: {
      // minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
      binaryMediaTypes: ["audio/*"],
      apiKeys: [
        {
          name: "${self:custom.apiKeys.sendAudioMessageApiKey.name}",
        },
      ],
    },
    environment: {
      DEPLOYMENT_REGION: "${self:custom.deployment.region}",
      CHATROOM_DB_TABLE: "${self:custom.resources.chatroomDb}",
      CHATROOM_S3_BUCKET: "${self:custom.resources.s3.chatroomS3Bucket}",
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      CHATROOM_S3_BUCKET_AUDIO_MESSAGES_FOLDER:
        "${self:custom.resources.s3.audioMessageFolder}",
    },
    lambdaHashingVersion: "20201221",
    stage: "${self:custom.deployment.stage}",
    iam: {
      role: {
        managedPolicies: [
          "arn:aws:iam::aws:policy/AmazonS3FullAccess",
          "arn:aws:iam::aws:policy/AmazonTranscribeFullAccess",
          // "arn:aws:iam::aws:policy/AmazonTranslateFullAccess",
          "arn:aws:iam::aws:policy/TranslateFullAccess",
          "arn:aws:iam::aws:policy/AmazonPollyFullAccess",
          // "arn:aws:iam::aws:policy/AmazonSNSFullAccess",
          // "arn:aws:iam::aws:policy/AmazonSQSFullAccess",
          "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess",
        ],
      },
    },
  },
  // import the function via paths
  functions: {
    hello,
    // connect: {
    //   handler: "connect",
    //   events: [
    //     {
    //       websocket: {
    //         route: "$connect",
    //       },
    //     },
    //   ],
    // },
    sendAudioMessage,
    transcribeAudioMessage,
    translateMessage,
    azureToken,
    connectChat,
    disconnectChat,
    message,
    syncChat,
  },
  resources: {
    Resources: {
      ChatroomDynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:custom.resources.chatroomDb}",
          AttributeDefinitions: [
            { AttributeName: "PK", AttributeType: "S" },
            { AttributeName: "SK", AttributeType: "S" },
            { AttributeName: "connectionId", AttributeType: "S" },
          ],
          KeySchema: [
            { AttributeName: "PK", KeyType: "HASH" },
            { AttributeName: "SK", KeyType: "RANGE" },
            // { AttributeName: "connectionId", KeyType: "HASH" },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: "connectionId_idx",
              KeySchema: [{ AttributeName: "connectionId", KeyType: "HASH" }],
              Projection: { ProjectionType: "ALL" },
            },
          ],
          // ProvisionedThroughput: {
          //   ReadCapacityUnits: 1,
          //   WriteCapacityUnits: 1,
          // },
          BillingMode: "PAY_PER_REQUEST",
          StreamSpecification: {
            StreamViewType: "NEW_IMAGE",
          },
        },
      },
      ChatroomS3Bucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "${self:custom.resources.s3.chatroomS3Bucket}",
          AccessControl: "Private",
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ["*"],
                AllowedHeaders: ["*"],
                AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
                MaxAge: 3000,
              },
            ],
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
