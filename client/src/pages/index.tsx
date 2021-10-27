import ICSSplashScreen from "../client/ICSSplashScreen";

function Homepage() {
  // const [{ data, fetching, error }] = useGetCurrentUserQuery();

  // if (error) return <p>{error.message}</p>;

  // if (!data?.currentUser) {
  //   if (process.browser) router.push("/login");
  //   return (
  //     <p>
  //       Redirecting to <Link href="/login">/login</Link>
  //       ...
  //     </p>
  //   );
  // }

  return <ICSSplashScreen></ICSSplashScreen>;
}

export default Homepage;
