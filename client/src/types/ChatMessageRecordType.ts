export interface ChatMessageRecordType {
  eventID: string;
  eventName: string;
  eventVersion: string;
  eventSource: string;
  awsRegion: string;
  dynamodb: Dynamodb;
  eventSourceARN: string;
}

export interface Dynamodb {
  ApproximateCreationDateTime: number;
  Keys: Keys;
  NewImage?: NewImage;
  SequenceNumber: string;
  SizeBytes: number;
  StreamViewType: string;
}

export interface Keys {
  SK: Pk;
  PK: Pk;
}

export interface Pk {
  S: string;
}

export interface ChatMessage {
  type?: Pk;
  text?: Pk;
  imageUrl?: Pk;
  imageThumbnailUrl?: Pk;
  sketch?: Pk;
}

export interface NewImage {
  chatroomName: Pk;
  gender: Pk;
  SK: Pk;
  action: Pk;
  connectionId: Pk;
  language: Pk;
  PK: Pk;
  message: { M: ChatMessage };
  userName: Pk;
  timestamp: Timestamp;
  createdAt: Pk;
}

export interface Timestamp {
  N: string;
}
