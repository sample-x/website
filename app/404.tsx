'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import SamplesPage from './samples/SamplesPage';

export default function Custom404() {
  // Check if the URL contains a sample ID
  useEffect(() => {
    const pathname = window.location.pathname;
    // If we're looking at a sample page, render the SamplesPage component
    if (pathname.match(/\/samples\/[a-zA-Z0-9-]+/) || 
        pathname.match(/\/samples\/edit\/[a-zA-Z0-9-]+/)) {
      // This will be handled by the return statement below
    }
  }, []);

  // Get the current URL
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // If it's a sample page, use our dynamic handler
  if (pathname.match(/\/samples\/[a-zA-Z0-9-]+/) || 
      pathname.match(/\/samples\/edit\/[a-zA-Z0-9-]+/)) {
    return <SamplesPage />;
  }

  // Otherwise show a standard 404 page
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Page Not Found</h2>
          <p className="mt-2 text-sm text-gray-600">
            We couldn't find the page you were looking for.
          </p>
        </div>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
} 