import "@/styles/globals.css";
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apollo-client';
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (

    <ApolloProvider client={client}>
      <Head>
        <title>Droplets Dashboard</title>
        <meta property="og:title" content="Droplets Dashboard" />
      </Head>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
