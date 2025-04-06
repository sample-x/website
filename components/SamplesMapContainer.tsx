'use client';

import { useState, useEffect } from 'react';
import { Sample } from '@/types/sample';
import dynamic from 'next/dynamic';
import { useSupabase } from '@/app/supabase-provider';

// Dynamically import the SampleMap component with no SSR
const SampleMap = dynamic(() => import('./SampleMap'), {
  ssr: false,
  loading: () => (
    <div className="map-placeholder" style={{
      height: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px'
    }}>
      <div style={{textAlign: 'center'}}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          margin: '0 auto 20px',
          border: '4px solid rgba(0, 0, 0, 0.1)',
          borderLeftColor: '#f29415',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading map component...</p>
      </div>
    </div>
  )
});

interface SamplesMapContainerProps {
  samples: Sample[];
  onSampleSelect?: (sample: Sample) => void;
}

export default function SamplesMapContainer({
  samples,
  onSampleSelect,
}: SamplesMapContainerProps) {
  const [mounted, setMounted] = useState(false);
  const [visibleSampleIds, setVisibleSampleIds] = useState<string[]>([]);

  // Add a global style for the spinner animation
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    setMounted(true);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="map-placeholder" style={{
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <div style={{textAlign: 'center'}}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 20px',
            border: '4px solid rgba(0, 0, 0, 0.1)',
            borderLeftColor: '#f29415',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Initializing map...</p>
        </div>
      </div>
    );
  }

  // Filter out samples without coordinates for debugging
  const samplesWithCoordinates = samples.filter(
    sample => typeof sample.latitude === 'number' && typeof sample.longitude === 'number'
  );
  
  console.log(`[SamplesMapContainer Debug] Passing ${samplesWithCoordinates.length} samples with coordinates to SampleMap`);

  // Add an adapter function to convert bounds to sample IDs
  const handleBoundsChange = (bounds: any) => {
    if (bounds && typeof bounds.contains === 'function') {
      // This is a Leaflet bounds object
      try {
        const visibleIds = samplesWithCoordinates
          .filter(sample => 
            sample.latitude && 
            sample.longitude && 
            bounds.contains([sample.latitude, sample.longitude])
          )
          .map(sample => String(sample.id));
        
        setVisibleSampleIds(visibleIds);
      } catch (error) {
        console.error('Error handling map bounds change:', error);
      }
    } else if (Array.isArray(bounds)) {
      // Already in the format we need
      setVisibleSampleIds(bounds);
    }
  };

  return (
    <div className="map-wrapper" style={{ position: 'relative', height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
      <div className="map-info" style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        zIndex: 1000, 
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <p>Showing {samplesWithCoordinates.length} samples</p>
      </div>
      <SampleMap 
        samples={samplesWithCoordinates}
        onBoundsChange={handleBoundsChange}
      />
    </div>
  );
} 