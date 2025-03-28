'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sample } from '../types/sample';
import './SampleMap.css';

// Dynamically import the SampleMap component with no SSR
const SampleMap = dynamic(() => import('./SampleMap'), {
  ssr: false,
  loading: () => (
    <div className="map-placeholder">
      <div style={{textAlign: 'center'}}>
        <div className="map-loading-spinner"></div>
        <p>Loading map component...</p>
      </div>
    </div>
  )
});

interface SamplesMapContainerProps {
  samples: Sample[];
  onSampleSelect?: (sample: Sample) => void;
  onAddToCart?: (sample: Sample) => void;
  selectedSample?: Sample | null;
}

export default function SamplesMapContainer({
  samples,
  onSampleSelect,
  onAddToCart,
  selectedSample
}: SamplesMapContainerProps) {
  const [mounted, setMounted] = useState(false);
  const [visibleSampleIds, setVisibleSampleIds] = useState<string[]>([]);

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
    <div className="map-wrapper">
      <div className="map-info">
        <p>Showing {visibleSampleIds.length} samples in current view</p>
      </div>
      <SampleMap 
        samples={samples}
        onBoundsChange={setVisibleSampleIds}
      />
    </div>
  );
} 