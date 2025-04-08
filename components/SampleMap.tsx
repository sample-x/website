'use client';  // Add this at the top

import React, { useEffect, useRef, useState, FC } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '@/styles/Map.module.css';
import { Sample } from '@/types/sample';
import { sampleTypeColors } from '@/utils/constants';
import L from 'leaflet';
import { useRouter } from 'next/navigation';
import { LatLngBounds, Map as LeafletMap } from 'leaflet';

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

export interface SampleMapProps {
  samples: Sample[];
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  onTypeFilter?: (type: string | null) => void;
  onSampleSelect?: (sample: Sample) => void;
}

export const SampleMap: FC<SampleMapProps> = ({ samples, onBoundsChange, onTypeFilter, onSampleSelect }) => {
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

  // Calculate map bounds from samples
  const bounds = samples.reduce(
    (acc, sample) => {
      if (typeof sample.latitude === 'number' && typeof sample.longitude === 'number') {
        acc.extend([sample.latitude, sample.longitude]);
      }
      return acc;
    },
    new LatLngBounds([0, 0], [0, 0])
  );

  // Default to world center if no valid samples
  const center = !bounds.isValid() ? [20, 0] as [number, number] : bounds.getCenter();
  const zoom = 2;

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

  const handleMarkerClick = (sample: Sample) => {
    if (onSampleSelect) {
      onSampleSelect(sample);
    }
  };

  if (!mounted) {
    return null;
  }

  const usedTypes = getUsedSampleTypes(samples);
  const visibleTypes = usedTypes.slice(0, 5); // Only show first 5 types
  const remainingCount = usedTypes.length - 5;

  return (
    <div className="map-container" style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
      <MapContainer 
        center={center}
        zoom={zoom} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        scrollWheelZoom={true}
        whenReady={() => {
          if (bounds.isValid()) {
            const map = document.querySelector('.leaflet-container');
            if (map) {
              const leafletMap = (map as any)._leaflet_map;
              if (leafletMap) {
                leafletMap.fitBounds(bounds);
              }
            }
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="map-tiles-grayscale"
        />
        
        {samples.map((sample) => {
          if (typeof sample.latitude === 'number' && typeof sample.longitude === 'number') {
            return (
              <CircleMarker
                key={sample.id}
                center={[sample.latitude, sample.longitude]}
                radius={6}
                pathOptions={{
                  color: sample.inStock ? '#4CAF50' : '#f44336',
                  fillColor: sample.inStock ? '#4CAF50' : '#f44336',
                  fillOpacity: 0.7,
                }}
                eventHandlers={{
                  click: () => handleMarkerClick(sample),
                  mouseover: (e) => {
                    e.target.setStyle({
                      fillOpacity: 1,
                    });
                  },
                  mouseout: (e) => {
                    e.target.setStyle({
                      fillOpacity: 0.7,
                    });
                  },
                }}
              >
                <Popup className="sample-popup" autoPan={true}>
                  <div className="p-2">
                    <h3 className="font-bold text-base mb-2">{sample.name}</h3>
                    <ul className="list-disc pl-4 space-y-1 mb-3">
                      <li><span className="font-medium">Type:</span> {sample.type}</li>
                      <li><span className="font-medium">Location:</span> {sample.location}</li>
                      {sample.collection_date && <li><span className="font-medium">Collection Date:</span> {sample.collection_date}</li>}
                      {sample.storage_condition && <li><span className="font-medium">Storage:</span> {sample.storage_condition}</li>}
                      <li><span className="font-medium">Availability:</span> {sample.inStock ? 'In Stock' : 'Out of Stock'}</li>
                      <li><span className="font-medium">Price:</span> ${sample.price}</li>
                      <li><span className="font-medium">Biosafety Level:</span> <span className="bg-green-100 px-1 rounded text-xs inline-flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>BSL1</span>
                      </li>
                    </ul>
                    <div className="flex space-x-2 mt-3">
                      <button 
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs flex items-center"
                        onClick={() => router.push(`/samples/${sample.id}`)}
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Details
                      </button>
                      <button 
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                    
                    {/* Info section that appears when details button is clicked */}
                    <div className="mt-3 bg-gray-50 p-2 rounded text-xs border border-gray-200">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold">Additional Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <button className="bg-gray-200 hover:bg-gray-300 p-1 rounded text-xs text-center">Permits & Restrictions</button>
                        <button className="bg-gray-200 hover:bg-gray-300 p-1 rounded text-xs text-center">References</button>
                        <button className="bg-gray-200 hover:bg-gray-300 p-1 rounded text-xs text-center">Handling Information</button>
                        <button className="bg-gray-200 hover:bg-gray-300 p-1 rounded text-xs text-center">Instructions</button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          }
          return null;
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