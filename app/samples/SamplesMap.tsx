'use client'

import { useEffect, useState } from 'react'

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
  
  useEffect(() => {
    // In a real implementation, this would initialize a map library like Leaflet
    // For this example, we'll just simulate the map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter samples with valid coordinates
  const samplesWithCoordinates = samples.filter(sample => {
    return (
      (sample.coordinates && Array.isArray(sample.coordinates) && sample.coordinates.length === 2) ||
      (typeof sample.latitude === 'number' && typeof sample.longitude === 'number')
    );
  });
  
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
    <div className="map-simulation">
      <div className="map-container-inner">
        <div className="map-placeholder">
          <p>Map Visualization (Placeholder)</p>
          <p>In a real implementation, this would be an interactive map showing sample locations.</p>
          <div className="map-markers">
            {samplesWithCoordinates.map(sample => (
              <div 
                key={sample.id} 
                className="map-marker"
                style={{ backgroundColor: getSampleColor(sample.type) }}
                onClick={() => onSampleSelect && onSampleSelect(sample)}
              >
                <span className="marker-tooltip">{sample.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
