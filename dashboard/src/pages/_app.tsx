import "@/styles/globals.css";
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apollo-client';
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (

    <ApolloProvider client={client}>
      <Head>
        <title>The Unofficial Droplets Dashboard</title>
        <meta property="og:title" content="The Unofficial Droplets Dashboard" />
        <meta property="og:description" content="A simple dashboard showing the farming of Droplets from Drop" />
        <meta property="og:image" content="https://droplets.fyi/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@donovansolms" />
        <meta name="twitter:title" content="The Unofficial Droplets Dashboard" />
        <meta name="twitter:description" content="A simple dashboard showing the farming of Droplets from Drop" />
        <meta name="twitter:image" content="https://droplets.fyi/og.png" />
      </Head>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
