import dynamic from 'next/dynamic';
import Head from 'next/head';

const AppClient = dynamic(() => import('../src/App.jsx'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AppClient />
    </>
  );
}
