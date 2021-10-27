import { useState, useEffect, useRef } from "react";
import {
  ResultReason,
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  ServicePropertyChannel,
  PropertyId,
  Recognizer,
  SpeechRecognitionEventArgs,
} from "microsoft-cognitiveservices-speech-sdk";
import Cookie from "universal-cookie";

const getTokenOrRefresh = async () => {
  const cookie = new Cookie();
  const speechToken = cookie.get("speech-token");

  if (speechToken === undefined) {
    try {
      const res = await fetch(
        "ENTER_THE_URL_OF_THE_API_ENDPOINT_TO_RETRIEVE_THE_SPEECH_TO_TEXT_AZURE_TOKEN"
        // "https://....execute-api.eu-central-1.amazonaws.com/development/azureToken",
        {
          headers: {
            "X-Api-Key": "ENTER_YOUR_SERVERLESS_FRAMEWORK_X_API_KEY_FOR_AZURE_TOKEN_HERE",
          },
        }
      );
      const resJson = await res.json();
      const token = resJson.token;
      const region = resJson.region;
      cookie.set("speech-token", region + ":" + token, {
        maxAge: 540,
        path: "/",
      });

      return { authToken: token, region: region };
    } catch (err) {
      console.log(err);
      return { authToken: null, error: "error" };
    }
  } else {
    const idx = speechToken.indexOf(":");
    return {
      authToken: speechToken.slice(idx + 1),
      region: speechToken.slice(0, idx),
    };
  }
};

export default function useAzureTranscribeStreaming(chatLanguage: string) {
  const [transcribedText, setTranscribedText] = useState<string>("");
  const speechRecognizer = useRef<SpeechRecognizer | undefined>();
  const [language] = useState(chatLanguage);

  const getAndSetToken = async () => {
    const tokenRes = await getTokenOrRefresh();
  };

  const recognizingSpeech = async (
    s: Recognizer,
    e: SpeechRecognitionEventArgs
  ) => {
  };

  const recognizedSpeech = async (
    s: Recognizer,
    e: SpeechRecognitionEventArgs
  ) => {
    if (e.result.text) {
      setTranscribedText(e.result.text);
    }
    const sr = s as SpeechRecognizer;
    sr.stopContinuousRecognitionAsync(function () {
      s.close();
    });
  };

  const sttFromMic = async () => {
    setTranscribedText("");
    const tokenObj = await getTokenOrRefresh();

    const speechConfig = SpeechConfig.fromAuthorizationToken(
      tokenObj.authToken,
      tokenObj.region
    );
    speechConfig.enableDictation();
    speechConfig.setServiceProperty(
      "punctuation",
      "explicit",
      ServicePropertyChannel.UriQueryParameter
    );
    speechConfig.setProperty(
      PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs.toString(),
      "5000"
    );
    speechConfig.setProperty(
      PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs.toString(),
      "5000"
    );

    if (language === "arab") {
      speechConfig.speechRecognitionLanguage = "ar-EG";
    } else if (language === "cmn-CN") {
      speechConfig.speechRecognitionLanguage = "zh-CN";
    } else {
      speechConfig.speechRecognitionLanguage = language;
    }

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();

    speechRecognizer.current = new SpeechRecognizer(speechConfig, audioConfig);

    speechRecognizer.current.recognizeOnceAsync(
      (result) => {
        let displayText;
        if (result.reason === ResultReason.RecognizedSpeech) {
          displayText = `RECOGNIZED: Text=${result.text}`;
          setTranscribedText(result.text);
        } else {
          displayText =
            "ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.";
        }
      },
      (e) => {
        console.log("--- recognizeOnceAsync error:", e);
      }
    );
  };

  useEffect(() => {
    getAndSetToken();
  }, []);

  return {
    transcribedText,
    setTranscribedText,
    sttFromMic,
    speechRecognizer,
  };
}
