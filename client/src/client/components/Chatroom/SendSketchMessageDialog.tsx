import { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { ReactSketchCanvas } from "react-sketch-canvas";

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem",
};

export default function SendSketchMessageDialog({
  sendSketchMessage,
  isSendSketchMessageDialogOpen,
  setIsSendSketchMessageDialogOpen,
}: {
  sendSketchMessage: (sketch: any) => void;
  isSendSketchMessageDialogOpen: boolean;
  setIsSendSketchMessageDialogOpen: (state: boolean) => void;
}) {
  const canvasRef = useRef<any | null>(null);

  const canvasToPng = async () => {
    canvasRef.current
      .exportImage("png")
      .then((data: string) => {
        if (canvasRef.current) {
          sendSketchMessage(data);
          setIsSendSketchMessageDialogOpen(false);
          canvasRef.current?.resetCanvas();
        }
      })
      .catch((e: any) => {
        console.log(e);
      });
  };

  return (
    <Dialog
      open={isSendSketchMessageDialogOpen}
      onClose={() => setIsSendSketchMessageDialogOpen(false)}
      className="fixed z-10 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div
          className="relative bg-white rounded  mx-auto  p-8"
          style={{ height: "400px", width: "480px" }}
        >
          <Dialog.Title></Dialog.Title>
          <div
            className="text-2xl mb-4 italic p-4 bg-gray-100 rounded"
            style={{ height: "280px" }}
          >
            <ReactSketchCanvas
              ref={canvasRef}
              style={styles}
              width="100%"
              height="100%"
              strokeWidth={4}
              strokeColor="#6e90a2"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              className=" p-2"
              onClick={() => {
                canvasRef.current?.resetCanvas();
                setIsSendSketchMessageDialogOpen(false);
              }}
            >
              Abbrechen
            </button>
            {true && (
              <button
                className="border rounded p-2 text-white"
                style={{ backgroundColor: "#6e90a2" }}
                onClick={() => {
                  canvasToPng();
                }}
              >
                Nachricht senden
              </button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
