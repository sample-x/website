'use client';  // Add this at the top

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '@/styles/Map.module.css';
import { Sample } from '@/types/sample';
import { sampleTypeColors } from '@/utils/constants';
import L from 'leaflet';
import { useRouter } from 'next/navigation';

// Fix for Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

// Sample type colors for markers
const getMarkerColor = (type: string): string => {
  console.log(`[Map Marker Debug] Sample type: ${type}`);
  
  // Highly saturated colors for better visibility
  switch (type.toLowerCase()) {
    case 'bacterial':
      return '#ADFF2F'; // Bright Green
    case 'viral':
      return '#FF1493'; // Deep Pink
    case 'fungal':
      return '#FFD700'; // Gold
    case 'cell line':
      return '#9932CC'; // Dark Orchid
    case 'plant':
      return '#32CD32'; // Lime Green
    case 'animal':
      return '#FF8C00'; // Dark Orange
    case 'water':
      return '#0066FF'; // Bright Blue
    case 'soil':
      return '#967259'; // Walnut brown
    case 'environmental':
      return '#599E94'; // Turquoise
    default:
      return '#D62828'; // Red (default for unspecified types)
  }
};

// After the getMarkerColor function, add a new constant for the legend
const sampleTypes = [
  { type: 'bacterial', label: 'Bacterial' },
  { type: 'viral', label: 'Viral' },
  { type: 'fungal', label: 'Fungal' },
  { type: 'cell line', label: 'Cell Line' },
  { type: 'plant', label: 'Plant' },
  { type: 'animal', label: 'Animal' },
  { type: 'water', label: 'Water' },
  { type: 'soil', label: 'Soil' },
  { type: 'environmental', label: 'Environmental' }
];

// Function to get actually used sample types to display in legend
const getUsedSampleTypes = (samples: Sample[]) => {
  const usedTypes = new Set<string>();
  samples.forEach(sample => {
    if (sample.type) {
      usedTypes.add(sample.type.toLowerCase());
    }
  });
  
  return sampleTypes.filter(({ type }) => 
    usedTypes.has(type.toLowerCase())
  );
};

// BoundsUpdater component to handle map bounds changes
function BoundsUpdater({ samples, onChange }: { samples: Sample[], onChange?: (bounds: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      if (!onChange) return;
      const bounds = map.getBounds();
      onChange(bounds);
    }
  });

  return null;
}

interface SampleMapProps {
  samples: Sample[];
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  onTypeFilter?: (type: string | null) => void;
}

export default function SampleMap({ samples, onBoundsChange, onTypeFilter }: SampleMapProps) {
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Fix Leaflet's default icon paths if needed
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Calculate map center from samples
  const center = samples.reduce(
    (acc, sample) => {
      if (typeof sample.latitude === 'number' && typeof sample.longitude === 'number') {
        acc[0] += sample.latitude;
        acc[1] += sample.longitude;
        acc[2]++; // Count valid samples
      }
      return acc;
    },
    [0, 0, 0] // [sumLat, sumLng, count]
  );

  // Default to world center if no valid samples
  const mapCenter = center[2] > 0
    ? [center[0] / center[2], center[1] / center[2]] as [number, number]
    : [20, 0] as [number, number];

  // Function to handle clicking on a sample type in the legend
  const handleTypeClick = (type: string) => {
    // If already active, clear the filter
    const newFilter = activeFilter === type ? null : type;
    setActiveFilter(newFilter);
    
    // Call parent component to filter samples
    if (onTypeFilter) {
      onTypeFilter(newFilter);
    }
  };

  if (!mounted) {
    return <div>Loading map...</div>;
  }

  const usedTypes = getUsedSampleTypes(samples);
  const visibleTypes = usedTypes.slice(0, 5); // Only show first 5 types
  const remainingCount = usedTypes.length - 5;

  return (
    <div className="map-container" style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
      <MapContainer 
        center={mapCenter}
        zoom={2} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="map-tiles-grayscale"
        />
        
        {samples.map((sample) => {
          const color = getMarkerColor(sample.type);
          
          return (
            <CircleMarker
              key={sample.id}
              center={[sample.latitude as number, sample.longitude as number]}
              radius={7}
              pathOptions={{
                fillColor: color,
                color: 'black',
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.7
              }}
              className="no-grayscale"
            >
              <Popup className="sample-popup" autoPan={true}>
                <div>
                  <h3 className="font-bold">{sample.name}</h3>
                  <p>Type: {sample.type}</p>
                  <p>ID: {sample.id}</p>
                  <button 
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => router.push(`/samples/${sample.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        
        <BoundsUpdater samples={samples} onChange={onBoundsChange} />
      </MapContainer>
      
      {/* Map Legend */}
      <div className="map-legend" style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '6px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
        minWidth: '120px',
        maxWidth: '150px',
        maxHeight: '200px',
        overflowY: 'auto',
        fontSize: '11px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px' 
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>Sample Types</h4>
          {activeFilter && (
            <button 
              onClick={() => handleTypeClick(activeFilter)}
              style={{ 
                fontSize: '10px', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: '#666',
                padding: '2px'
              }}
            >
              Clear
            </button>
          )}
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '12px 1fr', 
          gap: '4px',
          rowGap: '6px', 
          alignItems: 'center',
          fontSize: '10px'
        }}>
          {usedTypes.map(({ type, label }) => (
            <React.Fragment key={type}>
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: getMarkerColor(type),
                border: '1px solid rgba(0,0,0,0.2)',
                cursor: 'pointer'
              }} 
              onClick={() => handleTypeClick(type)}
              />
              <span 
                style={{ 
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: activeFilter === type ? 'bold' : 'normal'
                }} 
                onClick={() => handleTypeClick(type)}
              >
                {label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Add global styling for Leaflet popups to fix z-index issues */}
      <style jsx global>{`
        .leaflet-popup {
          z-index: 1000 !important;
        }
        .leaflet-popup-content-wrapper {
          z-index: 1001 !important;
        }
        .leaflet-popup-tip {
          z-index: 1001 !important;
        }
      `}</style>
    </div>
  );
} 