'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sample } from '../types/sample';

// Dynamically import the map component to avoid SSR issues
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

  const handleBoundsChange = (ids: string[]) => {
    setVisibleSampleIds(ids);
  };

  return (
    <div className="map-section">
      <SampleMap 
        samples={samples}
        onBoundsChange={handleBoundsChange}
      />
      <div className="map-info">
        <p className="text-sm text-gray-600 mt-2">
          Showing {visibleSampleIds.length} samples in the current view
        </p>
      </div>
    </div>
  );
} 