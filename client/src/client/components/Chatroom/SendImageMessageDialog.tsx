import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { ImageSearchResultType } from "../../../types/ImageSearchResultType";

export default function SendImageMessageDialog({
  //setImageMessage,
  sendImageMessage,
  isSendImageMessageDialogOpen,
  setIsSendImageMessageDialogOpen,
}: //setSendImageMessage,
{
  // setImageMessage: (
  //   imageMessage: {
  //     imageUrl: string;
  //     imageThumbnailUrl: string;
  //   } | null
  // ) => void;
  sendImageMessage: (image: ImageSearchResultType) => void;
  isSendImageMessageDialogOpen: boolean;
  setIsSendImageMessageDialogOpen: (state: boolean) => void;
  // setSendImageMessage: (state: boolean) => void;
}) {
  const [searchImageResults, setSearchImageResults] = useState<
    ImageSearchResultType[] | null
  >(null);
  const [imageSearchTerm, setImageSearchTerm] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<ImageSearchResultType>();

  async function searchImageViaSearchTerm() {
    if (imageSearchTerm.length > 1) {
      const searchImageResultsFromApiJson = await fetch(
        `/api/imagesearch?term=${imageSearchTerm}`
      );
      const searchImageResultsFromApi =
        await searchImageResultsFromApiJson.json();
      setSearchImageResults(searchImageResultsFromApi);
    }
  }

  return (
    <Dialog
      open={isSendImageMessageDialogOpen}
      onClose={() => setIsSendImageMessageDialogOpen(false)}
      className="fixed z-10 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded  mx-auto w-2/3 p-8">
          <Dialog.Title></Dialog.Title>
          <div className="text-2xl mb-4 italic p-4 bg-gray-100 rounded">
            <div className="mt-1 flex space-x-4">
              <input
                placeholder="Starte die Bildersuche durch Eingabe von mindestens 2 Buchstaben ..."
                onChange={(evt) => setImageSearchTerm(evt.target.value)}
                id="imageSearchTerm"
                name="imageSearchTerm"
                required
                className=" flex-grow appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              />
              <button
                style={{ backgroundColor: "#6e90a2" }}
                onClick={searchImageViaSearchTerm}
                type="submit"
                className="whitespace-nowrap font-bold px-3 py-2 text-white focus:outline-none focus:ring-0 sm:text-sm rounded-md shadow"
              >
                Bilder suchen
              </button>
            </div>
            {!!searchImageResults && (
              <ul
                role="list"
                className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
              >
                {searchImageResults?.map((image: ImageSearchResultType) => (
                  <li key={image.thumbnailUrl} className="relative">
                    <div className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
                      <img
                        src={image.thumbnailUrl}
                        alt=""
                        className="object-cover pointer-events-none group-hover:opacity-75"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedImage(image);
                        }}
                        className="absolute inset-0 focus:outline-none"
                      >
                        <span className="sr-only">Bild an Chat senden</span>
                      </button>
                    </div>
                    {/* <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">
                    {file.title}
                  </p>
                  <p className="block text-sm font-medium text-gray-500 pointer-events-none">
                    {file.size}
                  </p> */}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              className=" p-2"
              onClick={() => {
                setSelectedImage(undefined);
                setSearchImageResults([]);
                setImageSearchTerm("");
                setIsSendImageMessageDialogOpen(false);
              }}
            >
              Abbrechen
            </button>
            {selectedImage && (
              <button
                className="border rounded p-2 bg-gray-500 text-white"
                onClick={() => {
                  // setIsReviewTranscribedChatMessageDialogOpen(false);
                  if (selectedImage) {
                    sendImageMessage(selectedImage);
                    setIsSendImageMessageDialogOpen(false);
                    setSelectedImage(undefined);
                    setSearchImageResults([]);
                    setImageSearchTerm("");
                  }
                }}
              >
                Nachricht Senden
              </button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
