import { ChatUser } from "../../../pages/app/[slug]";
import ChatMessage, { Message } from "./ChatMessage";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
// import useAWSClientTranscribeStreaming from "./useAWSClientTranscribeStreaming";
import useAzureTranscribeStreaming from "./useAzureTranscribeStreaming";

import { ChatMessageRecordType } from "../../../types/ChatMessageRecordType";
import {
  ChatMessageContentType,
  ChatMessageContentTypeStrings,
  ChatMessageType,
  ChatMessageTypeType,
} from "../../../types/ChatMessageType";
import { languageCodes as LANGUAGES } from "../../helpers/languageCodes";
import { GENDERS } from "../../helpers/genders";
import ReviewTranscribedChatMessageDialog from "./ReviewTranscribedMessagesDialog";
import SendImageMessageDialog from "./SendImageMessageDialog";
import { ImageSearchResultType } from "../../../types/ImageSearchResultType";
import SendSketchMessageDialog from "./SendSketchMessageDialog";
import {
  getChatroomUserQueryParams,
  prepareChatMessage,
} from "../../helpers/chatHelpers";

export const isBrowser = typeof window !== "undefined";
const NEXT_PUBLIC_AWS_WEBSOCKET_CONNECTION_XAPIKEY =
  process.env.NEXT_PUBLIC_AWS_WEBSOCKET_CONNECTION_XAPIKEY;

const Chat = ({
  chat,
  onLeaveChat,
}: {
  chat: ChatUser;
  onLeaveChat: (chatUser: ChatUser) => void;
}) => {
  const { transcribedText, setTranscribedText, sttFromMic, speechRecognizer } =
    useAzureTranscribeStreaming(chat.language);
  // Stack for received chat messages converted to audio from that other chat participants sent:
  const [audioMessages, setAudioMessages] = useState<
    Array<{ id: string; blob: Blob }>
  >([]);

  const [
    isReviewTranscribedChatMessageDialogOpen,
    setIsReviewTranscribedChatMessageDialogOpen,
  ] = useState<boolean>(false);

  const [isSendImageMessageDialogOpen, setIsSendImageMessageDialogOpen] =
    useState<boolean>(false);
  const [isSendSketchMessageDialogOpen, setIsSendSketchMessageDialogOpen] =
    useState<boolean>(false);

  // const currentAudio = useRef<HTMLAudioElement>(new Audio());
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const currentSource = useRef<HTMLSourceElement | null>(null);

  // Track the latest text that was transcribed and send to chat database to be translated and transformed to speech in each chat participants destination language.
  const [sendTranscribedText, setSendTranscribedText] =
    useState<boolean>(false);

  // const [sendImageMessage, setSendImageMessage] = useState<boolean>(false);

  // Manage WebsocketInstance for communicating with chatroom (server):
  const [websocketInstance, setWebsocketInstance] = useState<WebSocket>();

  // Stack of chat messages to be displayed in the chat window history:
  const [chatMessages, setChatMessages] = useState<Array<ChatMessageType>>([]);
  const prevChatMessages = usePrevious(chatMessages);

  const playNextAudioMessge = async () => {
    if (currentAudio.current && currentSource.current) {
      const nextAudioMessageObj = audioMessages[0];
      currentSource.current.src = URL.createObjectURL(nextAudioMessageObj.blob);
      await currentAudio.current.load();
      currentAudio.current.play();
    }
  };

  const onAudioPlaybackEnded = () => {
    currentAudio.current?.pause();
    if (currentSource.current) {
      currentSource.current.src = "";
      currentAudio.current?.load();
    }

    setAudioMessages((prevState) => {
      if (prevState.length > 0) {
        const prevAudioMessages = [...prevState];
        prevAudioMessages.shift();
        return prevAudioMessages;
      } else {
        return [];
      }
    });
  };

  useEffect(() => {
    if (isBrowser) {
      const websocket = new WebSocket(
        `wss://<ENTER_YOUR_URL_PART_HERE>.execute-api.eu-central-1.amazonaws.com/development?${getChatroomUserQueryParams(
          chat
        )}&x-api-key=${NEXT_PUBLIC_AWS_WEBSOCKET_CONNECTION_XAPIKEY}`
      );
      websocket.onopen = (ev: Event) => {
        setWebsocketInstance(websocket);
      };
    }

    // TODO: check if this block is needed and if an initial function call to play is needed
    if (currentAudio.current) {
      // currentAudio.current.play();
      currentAudio.current.onended = onAudioPlaybackEnded;
    }

    return () => {
      // Cleanup on unmount if ws wasn't closed already
      if (websocketInstance?.readyState !== 3) websocketInstance?.close();
    };
  }, []);

  useEffect(() => {
    if (isReviewTranscribedChatMessageDialogOpen === false) {
      if (speechRecognizer.current) {
        speechRecognizer.current.close();
        speechRecognizer.current = undefined;
      }
    }
  }, [isReviewTranscribedChatMessageDialogOpen, speechRecognizer]);

  function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  useEffect(() => {
    if (chatMessages.length > 0) {
      const chatMessageReceived = chatMessages[0];

      switch (chatMessageReceived.action) {
        case "CHAT_MESSAGE": {
          if (
            chatMessageReceived.message &&
            !chatMessageReceived.message.textTranslation &&
            chatMessageReceived.userName !== chat.name &&
            chatMessageReceived.message?.type === ChatMessageTypeType.TEXT &&
            !!chatMessageReceived.message?.text
          )
            translateAndGeneratePollySpeech({
              destinationLanguage: chat.language,
              sourceLanguage: chatMessageReceived.language || "",
              sourceText: chatMessageReceived.message.text,
              chatMessageId: chatMessageReceived.id || "",
              gender: chat.gender,
            });
          break;
        }

        default:
          break;
      }
    }
  }, [chatMessages]);

  // If audio messages - stack updates create a new HTMLAudioElement from the audio blob and set it to the currentAudio to be played:
  useEffect(() => {
    if (audioMessages.length > 0 && currentAudio.current?.paused) {
      playNextAudioMessge();
    }
  }, [audioMessages, currentAudio]);

  useEffect(() => {
    if (websocketInstance) {
      websocketInstance.onmessage = onWebsocketReceivedMessage;
    }
  }, [websocketInstance]);

  const removeUserIsTypingMessages = (
    chatMessages: ChatMessageType[],
    userName: string | undefined
  ) => {
    if (!userName) {
      return chatMessages;
    }
    return chatMessages.filter((chatMessage) => {
      if (
        chatMessage.userName === userName &&
        chatMessage.message?.type === ChatMessageTypeType.TYPING
      ) {
        return false;
      }
      return true;
    });
  };

  const onWebsocketReceivedMessage = async (ev: MessageEvent<any>) => {
    const chatMessageReceived = prepareChatMessage(JSON.parse(ev.data), chat);

    if (!chatMessageReceived) {
      return;
    }
    setChatMessages((prevState) => [
      chatMessageReceived,
      ...removeUserIsTypingMessages(prevState, chatMessageReceived?.userName),
    ]);
  };

  // Send the transcribed text to the chatroom server for it to be distributed to all chatroom participants:
  const sendTranscribedTextToDb = async (text: string) => {
    if (websocketInstance) {
      const messagePayload = {
        action: "message",
        chatroomName: chat.chat,
        message: { type: ChatMessageTypeType.TEXT, text },
        gender: chat.gender,
        language: chat.language,
        userName: chat.name,
      };

      websocketInstance.send(JSON.stringify(messagePayload));
    }
  };

  const sendUserIsPreparingMessageToDb = async () => {
    if (websocketInstance) {
      const messagePayload = {
        action: "message",
        chatroomName: chat.chat,
        message: { type: ChatMessageTypeType.TYPING },
        gender: chat.gender,
        language: chat.language,
        userName: chat.name,
      };

      websocketInstance.send(JSON.stringify(messagePayload));
    }
  };

  // Send the transcribed text to the chatroom server for it to be distributed to all chatroom participants:
  const sendSelectedImageToDb = async (
    imageSearchResult: ImageSearchResultType
  ) => {
    if (websocketInstance) {
      const messagePayload = {
        action: "message",
        chatroomName: chat.chat,
        message: {
          type: ChatMessageTypeType.IMAGE,
          imageUrl: imageSearchResult.url,
          imageThumbnailUrl: imageSearchResult.thumbnailUrl,
        },
        gender: chat.gender,
        language: chat.language,
        userName: chat.name,
      };

      websocketInstance.send(JSON.stringify(messagePayload));
    }
  };

  const sendSketchToDb = async (sketch: string) => {
    if (websocketInstance) {
      const messagePayload = {
        action: "message",
        chatroomName: chat.chat,
        message: {
          type: ChatMessageTypeType.SKETCH,
          sketch,
        },
        gender: chat.gender,
        language: chat.language,
        userName: chat.name,
      };

      websocketInstance.send(JSON.stringify(messagePayload));
    }
  };

  // If a transcribed Message has been created and flagged to be sent to the chat
  useEffect(() => {
    if (!!transcribedText && sendTranscribedText === true) {
      sendTranscribedTextToDb(transcribedText);
      setTranscribedText("");
    }
  }, [transcribedText, sendTranscribedText]);

  const translateAndGeneratePollySpeech = async ({
    destinationLanguage,
    sourceText,
    sourceLanguage,
    chatMessageId,
    gender,
  }: {
    destinationLanguage: string;
    sourceText: string;
    sourceLanguage: string;
    chatMessageId: string;
    gender: string;
  }) => {
    const response = await fetch(
      `https://<ENTER_YOUR_URL_PART_HERE>.execute-api.eu-central-1.amazonaws.com/development/translateMessage`,
      // `https://.,,.execute-api.eu-central-1.amazonaws.com/development/translateMessage`,
      {
        method: `POST`,
        mode: "cors",
        body: JSON.stringify({
          destinationLanguage,
          sourceLanguage,
          sourceText,
          chatMessageId,
          gender,
        }),
        headers: {
          "X-Api-Key": "<ENTER_YOUR_X_API_KEY_HERE",
        },
      }
    );
    const responseJSON = await response.json();

    // Replace chatMessage with new translation

    const updateChatMessageIndex = chatMessages.findIndex((chatMessage) => {
      return chatMessage.id === responseJSON.chatMessageId;
    });
    if (updateChatMessageIndex !== -1) {
      const updatedChatMessage = {
        ...chatMessages[updateChatMessageIndex],
        message: {
          ...chatMessages[updateChatMessageIndex].message,
          textTranslation: responseJSON.translateResponse?.TranslatedText,
        },
      };
      const updatedChatMessages = [...chatMessages];
      updatedChatMessages[updateChatMessageIndex] = updatedChatMessage;
      setChatMessages(updatedChatMessages);
    }

    const uInt8Array = new Uint8Array(responseJSON.audioStream.data);
    const arrayBuffer = uInt8Array.buffer;
    const blob = new Blob([arrayBuffer]);

    setAudioMessages((prevState) => [
      ...prevState,
      { id: Date.now().toString(), blob },
    ]);
    // setPollyBlob(blob);
  };

  return (
    <div className="flex flex-col h-full">
      <Image
        alt="background image"
        src="/images/bg-grafik.svg"
        layout="fill"
        objectFit="cover"
        quality={100}
      />
      <div className="col-span-10 text-right mx-4 mt-2 flex-shrink-0 relative">
        <b>EN</b> | DE
      </div>
      <div className="flex-grow h-full relative">
        <div className="flex flex-col absolute top-0 bottom-0 w-full p-4 space-y-4">
          <div className="grid grid-cols-2 gap-8">
            <header className="col-span-1 space-y-2 text-white">
              <h1 className="text-6xl font-bold uppercase tracking-wider">
                LOGBUCH
              </h1>
              <p>
                Um Deine Worte aufzunehmen und zu übersetzen, halte bitte das
                <svg
                  className="w-5 h-5 inline-block align-text-top mx-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                gedrückt, während Du sprichst. Außerdem kannst Du einfach mit
                einem Finger{" "}
                <svg
                  className="w-5 h-5 inline-block align-text-top mx-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                oder Bilder suchen{" "}
                <svg
                  className="w-5 h-5 inline-block align-text-top mx-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"
                  />
                </svg>{" "}
                und mit den anderen Teilnehmer:innen teilen.
              </p>
            </header>
          </div>
          <div className="relative grid grid-cols-2 flex-1 fley-grow gap-8">
            <div className="relative col-span-1 flex-1 flex flex-col">
              <div className="border p-4 absolute top-0 bottom-0 right-0 left-0 overflow-y-auto shadow-inner space-y-8 bg-white">
                {chatMessages.map(
                  (chatMessage, index) =>
                    chatMessage.message && (
                      <ChatMessage
                        key={index}
                        chatUser={{
                          chat: chatMessage.chatroomName || "",
                          // termsOfUseAndPrivacyAgreement: true,
                          name: chatMessage.userName || "",
                          gender: chatMessage.gender || "",
                          language: chatMessage.language || "",
                        }}
                        orientation={
                          chat.name === chatMessage.userName ? "right" : "left"
                        }
                        date={new Date(
                          parseInt(
                            chatMessage.timestamp || Date.now().toString()
                          )
                        ).toLocaleString()}
                        message={chatMessage.message}
                      ></ChatMessage>
                    )
                )}
              </div>
            </div>
            <section className="col-span-1 space-y-2 flex flex-col">
              <div className="overflow-y-auto space-y-4 flex-1 flex-grow">
                <div className="w-2/3 float-right">
                  <form className="w-full">
                    <select
                      defaultValue={chat.chat}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-0 sm:text-sm rounded-md"
                    >
                      <option value={chat.chat} disabled={true}>
                        {chat.chat}
                      </option>
                    </select>
                    <select
                      defaultValue={chat.language}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-0 sm:text-sm rounded-md"
                    >
                      <option
                        className="whitespace-pre"
                        value={chat.language}
                        disabled={true}
                      >
                        {LANGUAGES[`${chat.language}`].flag}
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        {LANGUAGES[`${chat.language}`].language}
                      </option>
                    </select>
                    <select
                      defaultValue={chat.gender}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-0 sm:text-sm rounded-md"
                    >
                      <option value={chat.gender} disabled={true}>
                        {GENDERS[`${chat.gender}`]}
                      </option>
                    </select>
                    <input
                      type="text"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-0 sm:text-sm rounded-md"
                      placeholder="Chatnamen eingeben ..."
                      value={chat.name}
                      readOnly={true}
                    />
                    {/* <div className="relative flex items-start my-4">
                    <div className="flex items-center h-5">
                      <input
                        aria-describedby="termsOfUseAndPrivacyAgreement"
                        type="checkbox"
                        className="focus:ring-0 h-4 w-4 gray-indigo-600 border-gray-300 rounded"
                        value={chat.name}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                    <label
                      htmlFor="offers"
                      className="font-medium text-gray-700"
                    >
                      Nutzungsbedingungen & Datenschutz akzeptieren
                    </label>
                  </div>
                  </div> */}
                    <button
                      style={{ backgroundColor: "#6e90a2" }}
                      type="submit"
                      className="font-bold mt-1 block w-full pl-3 pr-10 text-white py-2 text-base  focus:outline-none focus:ring-0 sm:text-sm rounded-md  border shadow"
                    >
                      Chat verlassen
                    </button>
                    {/* <button
                      onClick={(e) => {
                        e.preventDefault();
                        askAudioPermission();
                      }}
                      className="font-bold mt-1 block w-full pl-3 pr-10 text-white py-2 text-base bg-gray-500 focus:outline-none focus:ring-0 sm:text-sm rounded-md  border shadow"
                    >
                      askAudioPermission
                    </button> */}
                    {/* {websocketInstance && <p>{websocketInstance.readyState}</p>} */}
                    {/* {transcribedText} */}
                    {/* {info} */}
                  </form>
                  {/* <button
                    onClick={() => {
                      setMicRecordingActive((prevState) => !prevState);
                    }}
                    className="font-bold mt-1 block w-full pl-3 pr-10 text-white py-2 text-base bg-gray-500 focus:outline-none focus:ring-0 sm:text-sm rounded-md  border shadow"
                  >
                    {micRecordingActive ? "Stop recording" : "Start recording"}
                  </button> */}
                </div>
              </div>
              {/* {pollyBlob && (
                <div className="w-full ">
                  <Player srcBlob={pollyBlob} audio={true} />
                </div>
              )} */}
              <div className="flex-shrink-0 flex-grow-0 grid grid-cols-3 gap-4">
                <div
                  style={{
                    width: "100%",
                    paddingBottom: "100%",
                    position: "relative",
                  }}
                >
                  <button
                    className="flex flex-col border absolute top-0 bottom-0 w-full h-full text-white justify-between p-2 space-y-2"
                    style={{ backgroundColor: "#6e90a2" }}
                    onClick={async () => {
                      setSendTranscribedText(false);
                      await sttFromMic();
                      sendUserIsPreparingMessageToDb();
                      setIsReviewTranscribedChatMessageDialogOpen(true);
                    }}
                    // disabled={status === "recording"}
                  >
                    <div className="h-2/3 relative mt-4 w-full">
                      <Image
                        src="/images/np_microphone_888718_FFFFFF.svg"
                        layout="fill"
                        objectFit="contain"
                        quality={100}
                      ></Image>
                    </div>
                    <h3 className="uppercase w-full flex-shrink-0">
                      Übersetzen
                    </h3>
                  </button>
                </div>

                <div
                  style={{
                    width: "100%",
                    paddingBottom: "100%",
                    position: "relative",
                  }}
                >
                  <button
                    className="flex flex-col border absolute top-0 bottom-0 w-full h-full text-white justify-between p-2 space-y-2"
                    style={{ backgroundColor: "#6e90a2" }}
                    onClick={async () => {
                      // setSendTranscribedText(false);
                      // await sttFromMic();
                      // setIsReviewTranscribedChatMessageDialogOpen(true);
                      sendUserIsPreparingMessageToDb();
                      setIsSendImageMessageDialogOpen(true);
                    }}
                    // disabled={status === "recording"}
                  >
                    <div className="h-2/3 relative mt-4 w-full">
                      <Image
                        src="/images/np_search-image_3751119_FFFFFF.svg"
                        layout="fill"
                        objectFit="contain"
                        quality={100}
                      ></Image>
                    </div>
                    <h3 className="uppercase w-full flex-shrink-0">
                      Bildersuche
                    </h3>
                  </button>
                </div>
                <div
                  style={{
                    width: "100%",
                    paddingBottom: "100%",
                    position: "relative",
                  }}
                >
                  <button
                    className="flex flex-col border absolute top-0 bottom-0 w-full h-full text-white justify-between p-2 space-y-2"
                    style={{ backgroundColor: "#6e90a2" }}
                    onClick={async () => {
                      sendUserIsPreparingMessageToDb();
                      setIsSendSketchMessageDialogOpen(true);
                    }}
                  >
                    <div className="h-2/3 relative mt-4 w-full">
                      <Image
                        src="/images/np_brush_3668650_FFFFFF.svg"
                        layout="fill"
                        objectFit="contain"
                        quality={100}
                      ></Image>
                    </div>
                    <h3 className="uppercase w-full flex-shrink-0">Skizze</h3>
                  </button>
                </div>
                {/* <div
                  style={{
                    width: "100%",
                    paddingBottom: "100%",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    className="border absolute top-0 bottom-0 w-full h-full"
                    onClick={() => {
                      setSendTranscribedText(true);
                    }}
                    // disabled={status !== "recording"}
                  >
                    Stop recording
                  </button>
                </div> */}
                <div className="hidden">
                  <audio id="audio" ref={currentAudio} controls>
                    <source
                      id="source"
                      ref={currentSource}
                      src=""
                      type="audio/mp3"
                    />
                  </audio>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <ReviewTranscribedChatMessageDialog
        transcribedMessage={transcribedText}
        setTranscribedMessage={setTranscribedText}
        isReviewTranscribedChatMessageDialogOpen={
          isReviewTranscribedChatMessageDialogOpen
        }
        setIsReviewTranscribedChatMessageDialogOpen={
          setIsReviewTranscribedChatMessageDialogOpen
        }
        sendTranscribedMessageToChat={setSendTranscribedText}
      ></ReviewTranscribedChatMessageDialog>
      <SendImageMessageDialog
        isSendImageMessageDialogOpen={isSendImageMessageDialogOpen}
        setIsSendImageMessageDialogOpen={setIsSendImageMessageDialogOpen}
        sendImageMessage={sendSelectedImageToDb}
      ></SendImageMessageDialog>
      <SendSketchMessageDialog
        isSendSketchMessageDialogOpen={isSendSketchMessageDialogOpen}
        setIsSendSketchMessageDialogOpen={setIsSendSketchMessageDialogOpen}
        sendSketchMessage={sendSketchToDb}
      ></SendSketchMessageDialog>
    </div>
  );
};

export default Chat;
