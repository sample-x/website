'use client'

import { useEffect, useState } from 'react'
import LeafletMap from './LeafletMap'
import { isStaticExport } from '@/app/lib/staticData'

// Sample type definition
interface Sample {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  price: number;
  coordinates?: [number, number];
  latitude?: number;
  longitude?: number;
  collectionDate?: string;
  storageCondition?: string;
  availability: string;
  inStock?: boolean;
}

interface SamplesMapProps {
  samples: Sample[];
  onSampleSelect?: (sample: Sample) => void;
  onAddToCart?: (sample: Sample) => void;
  selectedSample?: Sample | null;
}

// Define color mapping for sample types
const typeColors: Record<string, string> = {
  'bacterial': '#8BC34A',
  'tissue': '#E91E63',
  'cell line': '#E91E63',
  'environmental': '#795548',
  'ice core': '#B3E5FC',
  default: '#757575'
};

// Get color based on sample type
const getSampleColor = (type: string): string => {
  if (!type) return typeColors.default;
  
  const normalizedType = type.toLowerCase();
  
  // Try exact match first
  if (typeColors[normalizedType]) {
    return typeColors[normalizedType];
  }
  
  // Try partial matches
  for (const [key, color] of Object.entries(typeColors)) {
    if (key !== 'default' && normalizedType.includes(key)) {
      return color;
    }
  }
  
  return typeColors.default;
};

export default function SamplesMap({ samples, onSampleSelect, onAddToCart, selectedSample }: SamplesMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isStatic, setIsStatic] = useState(false);
  const [hasLoggedDebug, setHasLoggedDebug] = useState(false);
  
  useEffect(() => {
    // Check if we're in static mode
    setIsStatic(isStaticExport());
    
    // Check for localStorage override
    if (typeof window !== 'undefined') {
      try {
        const forceDynamic = localStorage.getItem('forceDynamicMode') === 'true';
        if (forceDynamic) setIsStatic(false);
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
    // Mark as loaded
    setMapLoaded(true);
  }, []);
  
  // Filter samples with valid coordinates
  const samplesWithCoordinates = samples.filter(sample => {
    // Extract coordinates if they exist
    let hasValidCoords = false;
    
    // Check for coordinates array
    if (sample.coordinates && Array.isArray(sample.coordinates) && sample.coordinates.length === 2) {
      const [lat, lng] = sample.coordinates;
      hasValidCoords = typeof lat === 'number' && typeof lng === 'number';
    }
    
    // Check for separate lat/lng fields
    if (!hasValidCoords && typeof sample.latitude === 'number' && typeof sample.longitude === 'number') {
      hasValidCoords = true;
    }
    
    return hasValidCoords;
  });
  
  // Log debug info
  useEffect(() => {
    if (mapLoaded && !hasLoggedDebug) {
      console.log('Map data:', {
        samplesCount: samples.length,
        samplesWithCoordinates: samplesWithCoordinates.length,
        firstSample: samples[0],
        sampleFormats: samples.slice(0, 3).map(s => ({
          hasCoordinates: !!s.coordinates,
          coordFormat: s.coordinates ? typeof s.coordinates : null,
          hasLat: typeof s.latitude === 'number',
          hasLong: typeof s.longitude === 'number',
          latValue: s.latitude,
          longValue: s.longitude
        }))
      });
      setHasLoggedDebug(true);
    }
  }, [mapLoaded, samples, samplesWithCoordinates.length, hasLoggedDebug]);
  
  // Convert samples to marker format for LeafletMap
  const markers = samplesWithCoordinates.map(sample => {
    // Use coordinates if available, otherwise use latitude/longitude
    const position: [number, number] = sample.coordinates 
      ? sample.coordinates 
      : [Number(sample.latitude) || 0, Number(sample.longitude) || 0];
      
    return {
      position,
      popup: `<strong>${sample.name}</strong><br>${sample.type} sample<br>${sample.location}`
    };
  });
  
  // Calculate center point based on samples (average lat/lng)
  let center: [number, number] = [37.7749, -122.4194]; // Default to San Francisco
  
  if (markers.length > 0) {
    const sumLat = markers.reduce((sum, marker) => sum + marker.position[0], 0);
    const sumLng = markers.reduce((sum, marker) => sum + marker.position[1], 0);
    
    center = [
      sumLat / markers.length,
      sumLng / markers.length
    ];
  }
  
  if (!mapLoaded) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }
  
  if (samplesWithCoordinates.length === 0) {
    return (
      <div className="map-no-data">
        <p>No samples with location data available to display on the map.</p>
        <details style={{marginTop: '10px'}}>
          <summary style={{cursor: 'pointer', fontWeight: 'bold', color: '#666'}}>Debug Info</summary>
          <pre style={{
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px', 
            fontSize: '12px',
            maxHeight: '200px',
            overflow: 'auto',
            marginTop: '10px'
          }}>
            {JSON.stringify({
              totalSamples: samples.length,
              sampleFormats: samples.slice(0, 3).map(s => ({
                id: s.id,
                name: s.name,
                hasCoordinates: !!s.coordinates,
                coordFormat: s.coordinates ? typeof s.coordinates : null,
                coordinates: s.coordinates,
                hasLat: typeof s.latitude === 'number',
                hasLong: typeof s.longitude === 'number',
                latValue: s.latitude,
                longValue: s.longitude
              }))
            }, null, 2)}
          </pre>
        </details>
      </div>
    );
  }
  
  return (
    <div className="map-container">
      {markers.length > 0 && (
        <>
          <LeafletMap 
            markers={markers}
            center={center}
            zoom={3}
          />
          <div className="map-info" style={{margin: '10px 0', fontSize: '0.875rem', color: '#666'}}>
            Displaying {markers.length} sample locations
          </div>
        </>
      )}
      <div className="map-legend">
        <h3>Sample Types</h3>
        <ul>
          {Object.entries(typeColors).filter(([key]) => key !== 'default').map(([type, color]) => (
            <li key={type} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: color }}></div>
              <span>{type}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
