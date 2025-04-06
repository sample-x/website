import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';
import ScriptLoader from './components/ScriptLoader';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sample Exchange - MODIFIED BUILD',
  description: 'Modified build with timestamp 2024-04-06',
};

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin="anonymous"
        /> */}
        {/* Leaflet CSS is imported within SampleMap component */}
      </head>
      <body className={inter.className}>
        <div style={{ 
          backgroundColor: 'red', 
          color: 'white', 
          textAlign: 'center', 
          padding: '5px',
          fontWeight: 'bold',
          position: 'fixed',
          bottom: '0',
          width: '100%',
          zIndex: '9999'
        }}>
          BUILD VERIFICATION BANNER - TIMESTAMP: 2024-04-06
        </div>
        <ErrorBoundary>
          <Providers>
            <Navbar />
            <main className="min-h-screen">
              <Suspense fallback={<div>Loading...</div>}>
                {children}
              </Suspense>
            </main>
            <Footer />
            <ToastContainer position="bottom-right" />
            <ScriptLoader />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
