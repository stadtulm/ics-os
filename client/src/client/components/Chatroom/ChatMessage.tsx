import { ChatUser } from "../../../pages/app/[slug]";
import { languageCodes as LANGUAGES } from "../../helpers/languageCodes";
import {
  ChatMessageContentType,
  ChatMessageTypeType,
} from "../../../types/ChatMessageType";
import Image from "next/image";
import styled from "styled-components";

const Dots = styled.div`
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #6e90a2;
  color: #6e90a2;
  animation: dotFlashing 1s infinite linear alternate;
  animation-delay: 0.5s;

  &:before,
  &:after {
    content: "";
    display: inline-block;
    position: absolute;
    top: 0;
  }

  &:before {
    left: -15px;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: #6e90a2;
    color: #6e90a2;
    animation: dotFlashing 1s infinite alternate;
    animation-delay: 0s;
  }

  &:after {
    left: 15px;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: #6e90a2;
    color: #6e90a2;
    animation: dotFlashing 1s infinite alternate;
    animation-delay: 1s;
  }

  @keyframes dotFlashing {
    0% {
      background-color: #6e90a2;
    }
    50%,
    100% {
      background-color: #9bcce6;
    }
  }
`;

export type Message = {
  text: string;
  date: string;
};

// text: chatMessage.message,
//                       date: new Date(
//                         parseInt(chatMessage.timestamp || Date.now().toString())
//                       ).toLocaleString(),

const ChatMessage = ({
  chatUser,
  message,
  date,
  orientation = "left",
}: {
  chatUser: ChatUser;
  message: ChatMessageContentType;
  date: string;
  orientation?: "left" | "right";
}) => {

  const chatBubble = (content: JSX.Element) => {
    return (
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm  relative">
        {content}
      </div>
    );
  };
  const getMessageContentDisplay = (messageContent: ChatMessageContentType) => {
    switch (messageContent.type) {
      case ChatMessageTypeType.TEXT:
        return chatBubble(
          <>
            {messageContent.text}
            <br />
            <span className="text-gray-500">
              {messageContent.textTranslation}
            </span>
          </>
        );
        break;
      case ChatMessageTypeType.IMAGE:
        if (messageContent.imageThumbnailUrl) {
          return chatBubble(
            <img
              className="w-full"
              src={messageContent.imageThumbnailUrl}
            ></img>
          );
        }
        break;
      case ChatMessageTypeType.SKETCH:
        if (messageContent.sketch) {
          return chatBubble(
            <img src={messageContent.sketch} className="w-full"></img>
          );
        }
        break;
      case ChatMessageTypeType.TYPING:
        return chatBubble(
          <>
            <span className="flex px-4">
              <Dots />
            </span>
          </>
        );
        break;
      default:
        return "";
        break;
    }
    return "";
  };
  return (
    <div
      className={`relative ${
        orientation === "right" ? "float-right" : "float-left"
      } w-3/4 space-y-1 overflow-hidden`}
    >
      {/* <div className="absolute w-8 h-8 top-4 z-10 rounded-full border">
        <Image
          src={`https://avatars.dicebear.com/api/${chatUser.gender.toLowerCase()}/${chatUser.name.toLowerCase()}.svg`}
          // width="20"
          // height="20"
          objectFit="contain"
          layout="fill"
        ></Image>
      </div> */}
      <p className="block truncate text-gray-500 mx-2 relative">
        <div className="inline-block align-middle mr-1">
          <Image
            src={`https://avatars.dicebear.com/api/${
              chatUser.gender === "MALE" || chatUser.gender === "FEMAIL"
                ? chatUser.gender.toLowerCase()
                : "human"
            }/${chatUser.name.toLowerCase()}.svg`}
            width="22"
            height="22"
          ></Image>
        </div>

        <small className="">
          <b>{chatUser.name}</b>
          {LANGUAGES[chatUser.language]?.flag && (
            <span className="mx-1">{LANGUAGES[chatUser.language]?.flag},</span>
          )}
          <span className="mx-1">{date}</span>
        </small>
      </p>
      {getMessageContentDisplay(message)}
    </div>
  );
};

export default ChatMessage;
