import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";

/**
 * Used on the Login and Sign Up screens to handle authentication. Can be shared between those as Passport.js doesn't differentiate between logging in and signing up.
 */
export default function AuthenticationForm({
  setIsAuthenticationDialogOpen,
}: {
  setIsAuthenticationDialogOpen: (state: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { r } = router.query;
  const redirect = r?.toString();

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form
          className="space-y-6"
          action="#"
          onSubmit={(evt) => {
            evt.preventDefault();
            // POST a request with the users email or phone number to the server
            fetch(`/api/auth/magiclink`, {
              method: `POST`,
              body: JSON.stringify({
                redirect,
                destination: email,
              }),
              headers: { "Content-Type": "application/json" },
            })
              .then((res) => res.json())
              .then((json) => {
                if (json.success) {
                  // Add the email and security code to the query params so we can show them on the /check-mailbox page
                  // router.push(
                  //   `/check-mailbox?e=${encodeURIComponent(email)}&c=${
                  //     json.code
                  //   }`
                  // );
                  toast.success(
                    () => (
                      <div>
                        Login Email erfolgreich versandt.<br></br>
                        <br></br>
                        Bitte klicke den Link der an Deine gerade angegebene
                        E-Mail-Adresse: {email}, <br></br> die mit dem Code{" "}
                        {json.code} versandt wurde.
                      </div>
                    ),
                    { duration: 8000 }
                  );
                  setIsAuthenticationDialogOpen(false);
                }
              });
          }}
        >
          <div>
            <h2 className="block uppercase font-medium text-gray-700 track-wider text-2xl text-center">
              Login to ICS
            </h2>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                type="email"
                placeholder="me@hello.com"
                onChange={(evt) => setEmail(evt.target.value)}
                id="email"
                name="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
