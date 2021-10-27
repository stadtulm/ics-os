import { Toaster } from "react-hot-toast";
import type { AppProps } from "next/app";
import { Provider } from "urql";
import { client } from "../client/graphql/client";
import Layout from "../client/components/Layout";
import "../client/styles/tailwind.css";
import "../client/styles/fontStyles.css";
import Div100vh from "react-div-100vh";

import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "../client/styles/globalStyle";
import { Theme } from "../client/styles/theme";

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <GlobalStyle />
      <ThemeProvider theme={Theme}>
        <Div100vh>
          <Layout>
            <Component {...pageProps} />
            <Toaster />
          </Layout>
        </Div100vh>
      </ThemeProvider>
    </Provider>
  );
}

export default CustomApp;
