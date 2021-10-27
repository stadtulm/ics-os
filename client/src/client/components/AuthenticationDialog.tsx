import { useState } from "react";
import { Dialog } from "@headlessui/react";
import AuthenticationForm from "./AuthenticationForm/index";

export default function AuthenticationDialog({
  isAuthenticationDialogOpen,
  setIsAuthenticationDialogOpen,
}: {
  isAuthenticationDialogOpen: boolean;
  setIsAuthenticationDialogOpen: (state: boolean) => void;
}) {
  return (
    <Dialog
      open={isAuthenticationDialogOpen}
      onClose={() => setIsAuthenticationDialogOpen(false)}
      className="fixed z-10 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded max-w-sm mx-auto">
          <Dialog.Title></Dialog.Title>
          <AuthenticationForm
            setIsAuthenticationDialogOpen={setIsAuthenticationDialogOpen}
          ></AuthenticationForm>
        </div>
      </div>
    </Dialog>
  );
}
