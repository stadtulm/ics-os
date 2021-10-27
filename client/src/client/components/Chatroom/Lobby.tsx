import { ShareIcon } from "@heroicons/react/solid";
import { ReactNode, ReactElement } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { languageCodes as LANGUAGES } from "../../helpers/languageCodes";
import { GENDERS } from "../../helpers/genders";
import { ChatUser } from "../../../pages/app/[slug]";

export type ChatUserInfo = {
  chat: string[];
  language: typeof LANGUAGES;
  gender: typeof GENDERS;
  name: string;
  termsOfUseAndPrivacyAgreement: boolean | undefined;
};

const Lobby = ({
  chatrooms,
  onEnterChat,
}: {
  chatrooms: { [key: string]: string }[];
  onEnterChat: (chatUser: ChatUser) => void;
}): ReactElement => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data: any) => {
    onEnterChat(data);
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
        <div className="flex absolute top-0 bottom-0 w-full p-4">
          <section
            id="Introduction"
            className="w-2/5  space-y-4 flex-col flex text-white h-full"
          >
            <h1 className="font-bold text-6xl flex-shrink-0 tracking-wider uppercase">
              Herzlich Willkommen
            </h1>
            <div
              className="overflow-y-auto space-y-4"
              style={{ flex: "1 1 auto" }}
            >
              <p>
                Hier steht eine kurze Einführung und Erläuterung des ICS und der
                Funktionen … Lorem ipsum dolor sit amet, consectetuer adipiscing
                elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
                natoque penatibus et magnis dis parturient montes, nascetur
                ridiculus mus. Donec quam felis, ultricies nec, pellen- Viel
                Spaß im ICS!
              </p>
              <p>Spaß im ICS!</p>
            </div>
            <div className="self-end grid grid-cols-5  gap-24">
              <div></div>
              <div className="relative h-20 w-20">
                <Image
                  alt="background image"
                  src="/images/icn-conversation.svg"
                  layout="fill"
                  objectFit="contain"
                  quality={100}
                />
              </div>
              <div className="relative h-20 w-20">
                <Image
                  alt="background image"
                  src="/images/icn-drawing.svg"
                  layout="fill"
                  objectFit="contain"
                  quality={100}
                />
              </div>
              <div className="relative h-20 w-20">
                {" "}
                <Image
                  alt="background image"
                  src="/images/icn-image.svg"
                  layout="fill"
                  objectFit="contain"
                  objectPosition="bottom center"
                  quality={100}
                />
              </div>
              <div className="relative h-20 w-20">
                {" "}
                <Image
                  alt="background image"
                  src="/images/icn-friendship.svg"
                  layout="fill"
                  objectFit="contain"
                  quality={100}
                />
              </div>
            </div>
          </section>
          <div className="w-1/5"></div>
          <section
            id="Login"
            className="w-2/5 space-y-4 flex-col flex justify-center "
          >
            <div className="overflow-y-auto space-y-4 ">
              <h2 className="text-4xl uppercase">Settings</h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-0 sm:text-sm rounded-md"
                  {...register("chat", { required: true })}
                >
                  {chatrooms.map((chatroom) => {
                    const [slug, name] = Object.entries(chatroom)[0];
                    return (
                      <option key={slug} value={slug}>
                        {name}
                      </option>
                    );
                  })}
                </select>
                <select
                  defaultValue={"de-DE"}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-0 sm:text-sm rounded-md"
                  {...register("language", { required: true })}
                >
                  <option value="" disabled={true}>
                    Ich spreche
                  </option>
                  {Object.entries(LANGUAGES).map(
                    ([languageAbbreviation, languageObject]) => {
                      return (
                        <option
                          className="whitespace-pre"
                          key={languageAbbreviation}
                          value={languageAbbreviation}
                        >
                          {languageObject.flag}&nbsp;&nbsp;&nbsp;&nbsp;
                          {languageObject.language}
                        </option>
                      );
                    }
                  )}
                </select>
                <select
                  defaultValue={"male"}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-0 sm:text-sm rounded-md"
                  {...register("gender", { required: true })}
                >
                  <option value="" disabled={true}>
                    Meine Übersetzungsstimme ist
                  </option>
                  {Object.entries(GENDERS).map(([genderId, genderName]) => {
                    return (
                      <option key={genderId} value={genderId}>
                        {genderName}
                      </option>
                    );
                  })}
                </select>
                <input
                  type="text"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-0 sm:text-sm rounded-md"
                  placeholder="Ich heiße"
                  {...register("name", { required: true })}
                />
                <div className="relative flex items-start my-4">
                  <div className="flex items-center h-5">
                    <input
                      aria-describedby="termsOfUseAndPrivacyAgreement"
                      type="checkbox"
                      className="focus:ring-0 h-4 w-4 gray-indigo-600 border-gray-300 rounded"
                      {...register("termsOfUseAndPrivacyAgreement", {
                        required: true,
                      })}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="offers"
                      className="font-medium text-gray-700"
                    >
                      Ja zu Nutzungsbedingungen & Datenschutz des ICS
                    </label>
                  </div>
                </div>
                <button
                  style={{ backgroundColor: "#6e90a2" }}
                  type="submit"
                  className="font-bold mt-1 block w-full pl-3 pr-10 text-white py-2 text-base  focus:outline-none focus:ring-0 sm:text-sm rounded-md  border shadow"
                >
                  Unterhaltung starten
                </button>
              </form>
            </div>
          </section>

          <div className="col-span-2"></div>
          <div className="col-span-4"></div>
        </div>
      </div>
      {/* <section
        id="partnersAndSponsors"
        className="m-4 space-y-4  flex-shrink-0"
      >
        <h3>Gefördert und unterstützt von:</h3>
        <div className="w-full overflow-x-auto flex flex-shrink-0 space-x-4">
          <div className="h-24 w-72  flex-shrink-0 bg-gray-100">1</div>
          <div className="h-24 w-72  flex-shrink-0 bg-gray-100">2</div>
          <div className="h-24 w-72  flex-shrink-0 bg-gray-100">3</div>
          <div className="h-24 w-72  flex-shrink-0 bg-gray-100">4</div>
          <div className="h-24 w-72  flex-shrink-0 bg-gray-100">5</div>
        </div>
      </section> */}
    </div>
  );
};

export default Lobby;
