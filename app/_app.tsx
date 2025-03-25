import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Polyfill for browser globals in SSR
if (typeof window === 'undefined') {
  global.window = global as any;
  global.self = global as any;
  global.document = {
    createElement: () => ({}),
    getElementsByTagName: () => [],
    querySelector: () => null,
  } as any;
  global.navigator = {
    userAgent: 'node',
    platform: process.platform,
  } as any;
  global.location = { href: '', protocol: 'https:', host: '' } as any;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default MyApp; 