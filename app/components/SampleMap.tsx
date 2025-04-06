'use client';  // Add this at the top

import { useEffect, useRef, useState } from 'react';
import { Sample } from '../types/sample';
import type { Map } from 'leaflet';
import { FaCartPlus } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './SampleMap.css';
import { useMapEvents } from 'react-leaflet';

// Dynamic import of react-leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import('react-leaflet').then(mod => mod.CircleMarker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

interface SampleMapProps {
  samples: Sample[];
  onBoundsChange: (visibleSampleIds: string[]) => void;
}

// BoundsUpdater component to handle map bounds changes
function BoundsUpdater({ samples, onChange }: { samples: Sample[], onChange?: (ids: string[]) => void }) {
  const map = useMapEvents({
    moveend: () => {
      if (!onChange) return;
      const bounds = map.getBounds();
      const visibleSamples = samples.filter(sample => 
        typeof sample.latitude === 'number' && 
        typeof sample.longitude === 'number' && 
        bounds.contains([sample.latitude, sample.longitude] as [number, number])
      );
      onChange(visibleSamples.map(sample => String(sample.id || '')));
    }
  });

  return null;
}

export default function SampleMap({ samples, onBoundsChange }: SampleMapProps) {
  const mapRef = useRef<Map | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Fix Leaflet's default icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Calculate center point based on samples
  const center = samples.reduce(
    (acc, sample) => {
      if (typeof sample.latitude === 'number' && typeof sample.longitude === 'number') {
        acc[0] += sample.latitude;
        acc[1] += sample.longitude;
        acc[2]++;
      }
      return acc;
    },
    [0, 0, 0]
  );

  const mapCenter = center[2] > 0
    ? [center[0] / center[2], center[1] / center[2]] as [number, number]
    : [20, 0] as [number, number];

  if (!mounted) {
    return (
      <div className="map-placeholder">
        <div style={{textAlign: 'center'}}>
          <div className="map-loading-spinner"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  // Log before returning the JSX
  console.log(`[SampleMap Render Debug] Rendering map. Samples received: ${samples?.length || 0}`);

  return (
    <div className="map-container">
      <MapContainer 
        center={mapCenter}
        zoom={2} 
        className="leaflet-container"
        ref={mapRef}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
          className="grayscale-map"
        />
        
        {samples.map((sample, index) => {
          const color = getMarkerColor(sample.type);
          console.log(`[Map Marker Debug] Sample: ${sample.name}, Type: '${sample.type?.toLowerCase()}', Color: ${color}, Raw type: ${sample.type}`);
          return (
            <CircleMarker
              key={sample.id}
              center={[sample.latitude as number, sample.longitude as number]}
              radius={8}
              pathOptions={{
                fillColor: color,
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.9
              }}
              eventHandlers={{
                mouseover: () => {
                  console.log(`Marker hovered: ${sample.name}, Color: ${color}`);
                }
              }}
            >
              <Popup>
                <div className="sample-popup">
                  <h3>{sample.name}</h3>
                  <div className="sample-info-grid">
                    <div className="sample-info-label">Type:</div>
                    <div className="sample-info-value">
                      <div className="sample-type-indicator">
                        <span 
                          className="type-dot"
                          style={{ backgroundColor: color }}
                        ></span>
                        {sample.type}
                      </div>
                    </div>
                    <div className="sample-info-label">Location:</div>
                    <div className="sample-info-value">{sample.location}</div>
                    <div className="sample-info-label">Storage:</div>
                    <div className="sample-info-value">{sample.storage_condition}</div>
                    <div className="sample-info-label">Price:</div>
                    <div className="sample-info-value">${(sample.price || 0).toFixed(2)}</div>
                    <div className="sample-info-label">Quantity:</div>
                    <div className="sample-info-value">
                      <span 
                        className={`availability-badge ${
                          (sample.quantity || 0) > 0
                            ? 'available' 
                            : 'out-of-stock'
                        }`}
                      >
                        {(sample.quantity || 0) > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="add-to-cart-button"
                    onClick={() => alert(`Added ${sample.name} to cart!`)}
                    disabled={(sample.quantity || 0) <= 0}
                  >
                    <FaCartPlus /> Add to Cart
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        <BoundsUpdater samples={samples} onChange={onBoundsChange} />
      </MapContainer>
    </div>
  );
}

// Sample type colors for markers
const getMarkerColor = (type: string | null | undefined): string => {
  if (!type) return '#808080'; // Default gray for unknown types
  
  // Normalize the type to lowercase for case-insensitive matching
  const normalizedType = type.toLowerCase().trim();
  
  // Color mapping for different sample types
  switch (normalizedType) {
    case 'water':
      return '#4287f5'; // Blue
    case 'soil':
      return '#8B4513'; // Brown
    case 'air':
      return '#87CEEB'; // Sky blue
    case 'rock':
      return '#A9A9A9'; // Dark gray
    case 'bacterial':
    case 'bacteria':
      return '#9ACD32'; // Yellow-green
    case 'fungal':
    case 'fungi':
      return '#FFA500'; // Orange
    case 'viral':
    case 'virus':
      return '#FF69B4'; // Pink
    case 'tissue':
      return '#FF6347'; // Tomato red
    case 'cell line':
      return '#BA55D3'; // Medium orchid (purple)
    case 'animal':
      return '#CD853F'; // Peru (brown)
    case 'plant':
      return '#228B22'; // Forest green
    case 'marine':
      return '#00FFFF'; // Cyan
    default:
      return '#808080'; // Gray for unknown types
  }
}; 