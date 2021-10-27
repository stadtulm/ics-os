export enum ChatMessageTypeType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  SKETCH = "SKETCH",
  TYPING = "TYPING",
}

export type ChatMessageContentTypeStrings = keyof typeof ChatMessageTypeType;

export type ChatMessageContentType = {
  type?: ChatMessageTypeType;
  text?: string;
  textTranslation?: string;
  imageUrl?: string;
  imageThumbnailUrl?: string;
  sketch?: string;
};
export type ChatMessageType = {
  id?: string;
  gender?: string;
  chatroomName?: string;
  userName?: string;
  language?: string;
  message?: ChatMessageContentType;
  action: string;
  chatMessageId?: string;
  createdAt?: string;
  timestamp?: string;
};
