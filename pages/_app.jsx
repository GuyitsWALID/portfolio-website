import Head from 'next/head';
import '../src/index.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/ibex.svg" />
        <link rel="shortcut icon" href="/ibex.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
