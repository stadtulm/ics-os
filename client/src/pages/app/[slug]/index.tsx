import Link from "next/link";
import { useRouter } from "next/router";
import Lobby, { ChatUserInfo } from "../../../client/components/Chatroom/Lobby";
import Chat from "../../../client/components/Chatroom/Chat";
import UpgradeButton from "../../../client/components/UpgradeButton";
import { useGetProjectQuery } from "../../../client/graphql/getProject.generated";
import React, { useState } from "react";
import ICSSplashScreen from "../../../client/ICSSplashScreen";

export type ChatUser = {
  chat: string;
  termsOfUseAndPrivacyAgreement?: boolean;
  name: string;
  gender: string;
  language: string;
  chatUserId?: string;
};

function Project() {
  const router = useRouter();
  const { slug } = router.query;
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [{ data, fetching, error }] = useGetProjectQuery({
    variables: {
      slug: String(slug),
    },
  });
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);

  const enterChat = (chatUserData: ChatUser): void => {
    setChatUser({
      ...chatUserData,
    });
  };

  const leaveChat = (chatUserData: ChatUser): void => {
    setChatUser(null);
  };

  if (fetching) return <p>Loading...</p>;

  if (error) return <p>{error.message}</p>;

  if (!data?.project || typeof slug !== "string") return <p>Not found.</p>;

  if (chatUser) {
    return <Chat chat={chatUser} onLeaveChat={leaveChat} />;
  }
  if (showSplash) {
    return <ICSSplashScreen setShowSplash={setShowSplash}></ICSSplashScreen>;
  }
  return <Lobby chatrooms={[{ [slug]: slug }]} onEnterChat={enterChat} />;
}

export default Project;
