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
  
  useEffect(() => {
    // Check if we're in static mode
    setIsStatic(isStaticExport());
    
    // Mark as loaded
    setMapLoaded(true);
  }, []);
  
  // Filter samples with valid coordinates
  const samplesWithCoordinates = samples.filter(sample => {
    return (
      (sample.coordinates && Array.isArray(sample.coordinates) && sample.coordinates.length === 2) ||
      (typeof sample.latitude === 'number' && typeof sample.longitude === 'number')
    );
  });
  
  // Convert samples to marker format for LeafletMap
  const markers = samplesWithCoordinates.map(sample => {
    // Use coordinates if available, otherwise use latitude/longitude
    const position: [number, number] = sample.coordinates 
      ? sample.coordinates 
      : [sample.latitude || 0, sample.longitude || 0];
      
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
      </div>
    );
  }
  
  return (
    <div className="map-container">
      <LeafletMap 
        markers={markers}
        center={center}
        zoom={3}
      />
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
