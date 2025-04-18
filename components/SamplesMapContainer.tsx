'use client';

import { useState, useEffect } from 'react';
import { Sample } from '@/types/sample';
import dynamic from 'next/dynamic';
import { useSupabase } from '@/app/supabase-provider';
import type { SampleMapProps } from './SampleMap';

// Dynamically import the SampleMap component with no SSR
const SampleMap = dynamic<SampleMapProps>(() => import('./SampleMap').then(mod => mod.SampleMap), {
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
  onFilterChange?: (filteredSamples: Sample[]) => void;
}

export default function SamplesMapContainer({
  samples,
  onSampleSelect,
  onFilterChange,
}: SamplesMapContainerProps) {
  const [mounted, setMounted] = useState(false);
  const [visibleSampleIds, setVisibleSampleIds] = useState<string[]>([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
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
        // Check if style element exists before removing
        if (style && document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, []);

  // Handle type filter change
  const handleTypeFilter = (type: string | null) => {
    setActiveTypeFilter(type);
    
    if (onFilterChange) {
      // If type is null, clear the filter
      if (type === null) {
        onFilterChange(samples);
      } else {
        // Filter samples by type
        const filteredSamples = samples.filter(
          sample => sample.type && sample.type.toLowerCase() === type.toLowerCase()
        );
        onFilterChange(filteredSamples);
      }
    }
  };

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
  
  // Apply type filter if active
  const filteredSamples = activeTypeFilter
    ? samplesWithCoordinates.filter(
        sample => sample.type && sample.type.toLowerCase() === activeTypeFilter.toLowerCase()
      )
    : samplesWithCoordinates;
  
  console.log(`[SamplesMapContainer Debug] Passing ${filteredSamples.length} samples with coordinates to SampleMap${activeTypeFilter ? ` (filtered by ${activeTypeFilter})` : ''}`);

  // Add an adapter function to convert bounds to sample IDs
  const handleBoundsChange = (bounds: any) => {
    if (bounds && typeof bounds.contains === 'function') {
      // This is a Leaflet bounds object
      try {
        const visibleIds = filteredSamples
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
    <div className="map-wrapper" style={{ 
      position: 'relative', 
      height: '100%', 
      width: '100%',
      borderRadius: '8px', 
      overflow: 'hidden' 
    }}>
      <SampleMap 
        samples={filteredSamples}
        onBoundsChange={handleBoundsChange}
        onTypeFilter={handleTypeFilter}
      />
    </div>
  );
} 