import Link from "next/link";
import { useGetCurrentUserQuery } from "../../graphql/getCurrentUser.generated";
import AuthenticationDialog from "../AuthenticationDialog";
import { useState, useEffect } from "react";

function Navbar() {
  const [{ data }] = useGetCurrentUserQuery();
  const isAuthenticated = !!data?.currentUser;
  const [isAuthenticationDialogOpen, setIsAuthenticationDialogOpen] =
    useState<boolean>(false);

  // useEffect(() => {
  //   setIsAuthenticationDialogOpen(!!data?.currentUser);
  // }, [data?.currentUser]);

  return (
    <>
      <div className="flex justify-between  flex-shrink-0 px-4 py-2 text-xs relative z-10 bg-gray-800 text-white">
        <Link href={isAuthenticated ? `/app` : `/`}>ICS</Link>
        {isAuthenticated ? (
          <Link href="/api/auth/logout">Logout</Link>
        ) : (
          // <Link href="/login">Login</Link>
          <button onClick={() => setIsAuthenticationDialogOpen(true)}>
            Login
          </button>
        )}
      </div>{" "}
      <AuthenticationDialog
        isAuthenticationDialogOpen={isAuthenticationDialogOpen}
        setIsAuthenticationDialogOpen={setIsAuthenticationDialogOpen}
      ></AuthenticationDialog>
    </>
  );
}

export default Navbar;
