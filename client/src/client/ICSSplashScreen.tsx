import Image from "next/image";

export default function ICSSplashScreen({
  setShowSplash,
}: {
  setShowSplash?: (state: boolean) => void;
}) {
  return (
    <div
      className="flex flex-col h-full relative"
      onClick={() => {
        if (setShowSplash) {
          setShowSplash(false);
        }
      }}
    >
      <Image
        alt="background image"
        src="/images/bg-grafik.svg"
        layout="fill"
        objectFit="cover"
        quality={100}
      />
      <div
        className="absolute top-0 bottom-0 w-full"
        style={{ backgroundColor: "rgba(58, 83, 97, 0.9)" }}
      ></div>
      <div className="flex-grow p-8">
        <Image
          alt="background image"
          src="/images/audio.svg"
          width="130"
          height="85"
          quality={100}
        />
        <h1 className="text-6xl text-white relative mt-4 tracking-wider uppercase ">
          Intercultural<br></br>Communication<br></br>Space (ICS)
        </h1>
      </div>
      <div className="flex-shrink-0 flex-grow-0 grid grid-cols-5 gap-4 p-8">
        <div
          style={{
            width: "100%",
            paddingBottom: "100%",
            position: "relative",
          }}
        >
          {" "}
          <Image
            alt="background image"
            src="/images/box-logo-museum-ulm.svg"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
        </div>
        <div
          style={{
            width: "100%",
            paddingBottom: "100%",
            position: "relative",
          }}
        >
          <Image
            alt="background image"
            src="/images/box-logo-bund.svg"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
        </div>
        <div
          style={{
            width: "100%",
            paddingBottom: "100%",
            position: "relative",
          }}
        >
          {" "}
          <Image
            alt="background image"
            src="/images/box-logo-ulm-zukunft.webp"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
        </div>
        <div
          style={{
            width: "100%",
            paddingBottom: "100%",
            position: "relative",
          }}
        >
          {" "}
          <Image
            alt="background image"
            src="/images/box-logo-kfw.webp"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
        </div>

        <div
          style={{
            width: "100%",
            paddingBottom: "100%",
            position: "relative",
          }}
        >
          {" "}
          <Image
            alt="background image"
            src="/images/box-logo-ulm-clever.webp"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
        </div>
      </div>
    </div>
  );
}
