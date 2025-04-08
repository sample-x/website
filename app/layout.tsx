import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import Script from 'next/script';
import { AuthProvider } from './auth/AuthProvider';
import SupabaseProvider from './supabase-provider';
import { TailwindIndicator } from './components/TailwindIndicator';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sample Exchange Platform',
  description: 'Exchange scientific samples with researchers worldwide',
};

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current timestamp for cache busting
  const timestamp = Date.now();

  return (
    <html lang="en">
      <head>
        {/* Add cache-busting timestamp to all stylesheets */}
        <link 
          rel="stylesheet" 
          href={`https://unpkg.com/leaflet@1.9.4/dist/leaflet.css?v=${timestamp}`} 
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <SupabaseProvider>
            <AuthProvider>
              <CartProvider>
                <TailwindIndicator />
                <Providers>
                  <Navbar />
                  <main className="min-h-screen">
                    {children}
                  </main>
                  <Footer />
                  <ToastContainer position="bottom-right" />
                </Providers>
              </CartProvider>
            </AuthProvider>
          </SupabaseProvider>
        </ErrorBoundary>
        {/* Load fix scripts with highest priority */}
        <Script src="/cloudflare-fix.js" strategy="beforeInteractive" />
        {/* Fallback script tag for maximum compatibility */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Force all links to use direct navigation
                document.addEventListener('click', function(e) {
                  var target = e.target;
                  while (target && target.tagName !== 'A') {
                    target = target.parentElement;
                  }
                  if (target && target.tagName === 'A') {
                    var href = target.getAttribute('href');
                    if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
                      e.preventDefault();
                      window.location.href = href;
                      return false;
                    }
                  }
                }, true);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
