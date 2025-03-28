'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function ScriptLoader() {
  return (
    <Script 
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      crossOrigin="anonymous"
      strategy="lazyOnload"
      onError={(e) => {
        console.error('Error loading Leaflet:', e);
      }}
    />
  );
} 