import { ChatUser } from "../../pages/app/[slug]";
import { ChatMessageRecordType } from "../../types/ChatMessageRecordType";
import {
  ChatMessageType,
  ChatMessageTypeType,
} from "../../types/ChatMessageType";

export const getChatroomUserQueryParams = (chat: ChatUser) => {
  const { chat: chatroomName, name: userName, gender, language } = chat;
  return `chatroomName=${chatroomName}&userName=${userName}&gender=${gender}&language=${language}`;
};

export function prepareChatMessage(
  chatMessageRecord: Partial<ChatMessageRecordType>,
  chat: ChatUser
): ChatMessageType | undefined {
  const chatMessageEventName = chatMessageRecord.eventName;
  let chatMessage: ChatMessageType = {
    chatroomName: "",
    userName: "",
    gender: "",
    language: "",
    message: {
      type: ChatMessageTypeType.TEXT,
    },
    action: "",
    createdAt: "",
    timestamp: "",
  };

  switch (chatMessageEventName) {
    case "INSERT":
      // If NewImage entry exists the chatMessage was of type "message":

      chatMessage = {
        chatroomName:
          chatMessageRecord.dynamodb?.NewImage?.chatroomName?.S || "",
        userName: chatMessageRecord.dynamodb?.NewImage?.userName?.S || "",
        gender: chatMessageRecord.dynamodb?.NewImage?.gender?.S || "",
        language: chatMessageRecord.dynamodb?.NewImage?.language?.S || "",

        action: chatMessageRecord.dynamodb?.NewImage?.message
          ? "CHAT_MESSAGE"
          : "USER_ENTERED_CHAT",
        timestamp: chatMessageRecord.dynamodb?.NewImage?.timestamp?.N || "",
        createdAt: chatMessageRecord.dynamodb?.NewImage?.createdAt?.S || "",
      };

      if (!chatMessageRecord.dynamodb?.NewImage?.message) {
        chatMessage.message = {
          type: ChatMessageTypeType.TEXT,
          text: "👋",
        };
      } else {
        chatMessage.id =
          chatMessageRecord.dynamodb?.NewImage?.SK?.S.split("MESSAGE#")[1];

        switch (chatMessageRecord.dynamodb?.NewImage?.message.M.type?.S) {
          case "TEXT": {
            chatMessage.message = {
              type: ChatMessageTypeType.TEXT,
              text: chatMessageRecord.dynamodb?.NewImage?.message.M.text?.S,
            };
            break;
          }
          case "TYPING": {
            if (chatMessage.userName === chat.name) return undefined;
            chatMessage.message = {
              type: ChatMessageTypeType.TYPING,
            };
            break;
          }
          case "IMAGE": {
            chatMessage.message = {
              type: ChatMessageTypeType.IMAGE,
              imageUrl:
                chatMessageRecord.dynamodb?.NewImage?.message.M.imageUrl?.S,
              imageThumbnailUrl:
                chatMessageRecord.dynamodb?.NewImage?.message.M
                  .imageThumbnailUrl?.S,
            };
            break;
          }
          case "SKETCH": {
            chatMessage.message = {
              type: ChatMessageTypeType.SKETCH,
              sketch: chatMessageRecord.dynamodb?.NewImage?.message.M.sketch?.S,
            };
            break;
          }
          default:
            chatMessage.message = {
              type: ChatMessageTypeType.TEXT,
              text: "-",
            };
            break;
        }
      }

      break;
    case "REMOVE":
      chatMessage = {
        chatroomName:
          chatMessageRecord.dynamodb?.Keys.PK.S.split("CHAT#")[1] || "",
        userName:
          chatMessageRecord.dynamodb?.Keys.SK.S.split("_CID#")[0].split(
            "USER#"
          )[1] || "",
        gender: "",
        language: "",
        message: { type: ChatMessageTypeType.TEXT, text: "🚪" },
        action: "USER_LEFT_CHAT",
        timestamp: Date.now().toString() || "",
        createdAt: new Date().toISOString() || "",
      };
      break;
    default:
      break;
  }
  return chatMessage;
}
