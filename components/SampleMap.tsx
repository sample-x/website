'use client';  // Add this at the top

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '@/styles/Map.module.css';
import { Sample } from '@/types/sample';
import { sampleTypeColors } from '@/utils/constants';
import L from 'leaflet';

// Fix for Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

// Sample type colors for markers
const getMarkerColor = (type: string | null | undefined): string => {
  if (!type) return '#808080'; // Default gray for unknown types
  
  // Normalize the type to lowercase for case-insensitive matching
  const normalizedType = type.toLowerCase().trim();
  
  // Color mapping for different sample types
  switch (normalizedType) {
    case 'water':
      return '#0066FF'; // Bright blue
    case 'soil':
    case 'soil sample':
      return '#A52A2A'; // Brown
    case 'air':
      return '#00BFFF'; // Light blue
    case 'rock':
    case 'mineral sample':
      return '#696969'; // Dark gray
    case 'bacterial':
    case 'bacteria':
    case 'bacterial culture':
      return '#ADFF2F'; // Green yellow
    case 'fungal':
    case 'fungi':
      return '#FF8C00'; // Dark orange
    case 'viral':
    case 'virus':
      return '#FF1493'; // Deep pink
    case 'tissue':
      return '#FF4500'; // Orange red
    case 'cell line':
      return '#9932CC'; // Dark orchid
    case 'animal':
      return '#B8860B'; // Dark goldenrod
    case 'plant':
      return '#008000'; // Green
    case 'marine':
      return '#00FFFF'; // Cyan
    case 'ice core':
      return '#E0FFFF'; // Light cyan
    case 'environmental':
      return '#2E8B57'; // Sea green
    default:
      return '#FFA500'; // Orange for unknown
  }
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
}

export default function SampleMap({ samples, onBoundsChange }: SampleMapProps) {
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

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

  if (!mounted) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="map-container" style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={mapCenter}
        zoom={2} 
        style={{ height: '100%', width: '100%', filter: 'grayscale(100%)' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {samples.map((sample) => {
          // Get color based on sample type
          const color = getMarkerColor(sample.type);
          console.log(`[Map Marker Debug] Rendering sample: ${sample.name}, Type: ${sample.type}, Color: ${color}`);
          
          return (
            <CircleMarker
              key={sample.id}
              center={[sample.latitude as number, sample.longitude as number]}
              radius={10}
              pathOptions={{
                fillColor: color,
                color: 'black',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
              }}
              className="no-grayscale"
            >
              <Popup>
                <div style={{ minWidth: '200px', padding: '10px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{sample.name}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px' }}>
                    <div>Type:</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span 
                        style={{ 
                          display: 'inline-block',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          marginRight: '5px'
                        }}
                      ></span>
                      {sample.type}
                    </div>
                    <div>Location:</div>
                    <div>{sample.location}</div>
                    {sample.storage_condition && (
                      <>
                        <div>Storage:</div>
                        <div>{sample.storage_condition}</div>
                      </>
                    )}
                    {sample.price !== undefined && (
                      <>
                        <div>Price:</div>
                        <div>${sample.price.toFixed(2)}</div>
                      </>
                    )}
                  </div>
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