'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="global-error-container">
          <div className="global-error-content">
            <h1>Something went terribly wrong!</h1>
            <p>
              A critical error has occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            {error.message && (
              <div className="error-details">
                <p>Error: {error.message}</p>
              </div>
            )}
            <button
              onClick={() => reset()}
              className="error-button"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
} 