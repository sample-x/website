'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sample } from '../types/sample';

// Dynamically import the SampleMap component with no SSR
const SampleMap = dynamic(() => import('./SampleMap'), {
  ssr: false,
  loading: () => (
    <div className="map-placeholder">
      <div style={{textAlign: 'center'}}>
        <div className="map-loading-spinner"></div>
        <p>Loading map...</p>
      </div>
    </div>
  ),
});

interface SamplesMapContainerProps {
  samples: Sample[];
}

export default function SamplesMapContainer({ samples }: SamplesMapContainerProps) {
  const [visibleSampleIds, setVisibleSampleIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="map-placeholder">
        <div style={{textAlign: 'center'}}>
          <div className="map-loading-spinner"></div>
          <p>Initializing map...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SampleMap 
        samples={samples} 
        onBoundsChange={setVisibleSampleIds} 
      />
      <div className="mt-2 text-sm text-gray-600">
        {visibleSampleIds.length} samples visible in current view
      </div>
    </div>
  );
} 