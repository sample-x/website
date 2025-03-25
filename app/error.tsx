'use client';

import React from 'react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="error-container">
      <div className="error-content">
        <h1>Something went wrong</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        {error.message && (
          <div className="error-details">
            <p>Error: {error.message}</p>
          </div>
        )}
        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="error-button"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 