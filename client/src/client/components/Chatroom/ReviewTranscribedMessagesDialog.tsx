import { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function ReviewTranscribedChatMessageDialog({
  transcribedMessage,
  setTranscribedMessage,
  isReviewTranscribedChatMessageDialogOpen,
  setIsReviewTranscribedChatMessageDialogOpen,
  sendTranscribedMessageToChat,
}: {
  transcribedMessage: string;
  setTranscribedMessage: (text: string) => void;
  isReviewTranscribedChatMessageDialogOpen: boolean;
  setIsReviewTranscribedChatMessageDialogOpen: (state: boolean) => void;
  sendTranscribedMessageToChat: (state: boolean) => void;
}) {
  return (
    <Dialog
      open={isReviewTranscribedChatMessageDialogOpen}
      onClose={() => setIsReviewTranscribedChatMessageDialogOpen(false)}
      className="fixed z-10 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded  mx-auto w-2/3 p-8">
          <Dialog.Title></Dialog.Title>
          <div className="text-2xl mb-4 italic p-4 bg-gray-100 rounded">
            {transcribedMessage}&nbsp;
          </div>
          <div className="flex justify-end space-x-4">
            <button
              className=" p-2"
              onClick={() => {
                setTranscribedMessage("");
                sendTranscribedMessageToChat(false);
                setIsReviewTranscribedChatMessageDialogOpen(false);
              }}
            >
              Abbrechen
            </button>
            <button
              className="border rounded p-2 bg-gray-500 text-white"
              onClick={() => {
                sendTranscribedMessageToChat(true);
                setIsReviewTranscribedChatMessageDialogOpen(false);
              }}
            >
              Nachricht Senden
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
