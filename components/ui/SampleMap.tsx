'use client';  // Add this at the top

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { Sample } from '../../app/types/sample';
import type { Map, LatLngTuple } from 'leaflet';

interface SampleMapProps {
  samples: Sample[];
  onBoundsChange: (visibleSampleIds: string[]) => void;
}

// Helper function to check if a sample has valid coordinates
function hasValidCoordinates(sample: Sample): boolean {
  return typeof sample.latitude === 'number' && 
         typeof sample.longitude === 'number' &&
         !isNaN(sample.latitude) && 
         !isNaN(sample.longitude);
}

// Helper function to get coordinates as LatLngTuple
function getCoordinates(sample: Sample): LatLngTuple | null {
  if (!hasValidCoordinates(sample)) return null;
  return [sample.latitude!, sample.longitude!] as LatLngTuple;
}

// BoundsUpdater component to handle map bounds changes
function BoundsUpdater({ samples, onChange }: { samples: Sample[], onChange?: (ids: string[]) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onChange) return;

    const updateVisibleSamples = () => {
      const bounds = map.getBounds();
      const visibleSamples = samples.filter(sample => {
        const coords = getCoordinates(sample);
        return coords ? bounds.contains(coords) : false;
      });
      onChange(visibleSamples.map(sample => String(sample.id)));
    };

    map.on('moveend', updateVisibleSamples);
    updateVisibleSamples(); // Initial update

    return () => {
      map.off('moveend', updateVisibleSamples);
    };
  }, [map, samples, onChange]);

  return null;
}

export default function SampleMap({ samples, onBoundsChange }: SampleMapProps) {
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const updateVisibleSamples = () => {
      const bounds = map.getBounds();
      const visibleSamples = samples.filter(sample => {
        const coords = getCoordinates(sample);
        return coords ? bounds.contains(coords) : false;
      });
      onBoundsChange(visibleSamples.map(sample => String(sample.id)));
    };

    map.on('moveend', updateVisibleSamples);
    updateVisibleSamples(); // Initial update

    return () => {
      map.off('moveend', updateVisibleSamples);
    };
  }, [samples, onBoundsChange]);

  // Filter out samples without valid coordinates
  const validSamples = samples.filter(hasValidCoordinates);

  return (
    <div className="relative">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '500px', width: '100%' }}
        className="z-0 rounded-lg shadow-lg"
        ref={mapRef}
      >
        <TileLayer
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />
        {validSamples.map((sample, index) => {
          const coords = getCoordinates(sample);
          if (!coords) return null;
          
          return (
            <CircleMarker
              key={sample.id || index}
              center={coords}
              radius={8}
              pathOptions={{
                fillColor: getMarkerColor(sample.type),
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div className="min-w-[200px] p-2">
                  <h3 className="text-lg font-bold mb-2">{sample.name}</h3>
                  <div className="space-y-1">
                    <p><span className="font-semibold">Type:</span> {sample.type}</p>
                    <p><span className="font-semibold">Location:</span> {sample.location}</p>
                    <p><span className="font-semibold">Storage:</span> {sample.storage}</p>
                    <p><span className="font-semibold">Price:</span> ${(sample.price ?? 0).toFixed(2)}</p>
                    <p><span className="font-semibold">Availability:</span> {sample.availability}</p>
                  </div>
                  <button 
                    className="mt-3 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 w-full transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        <BoundsUpdater samples={validSamples} onChange={onBoundsChange} />
        
        {/* Map Legend */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[1000] border border-gray-200">
          <div className="text-sm font-semibold mb-2">Sample Types</div>
          <div className="space-y-1.5">
            {Object.entries(sampleTypeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-gray-400"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </MapContainer>
    </div>
  );
}

const sampleTypeColors: { [key: string]: string } = {
  'tissue': '#ff6b6b',
  'bacterial': '#82ca9d',
  'cell line': '#ff69b4',
  'environmental': '#20b2aa',
  'ice core': '#87ceeb'
};

const getMarkerColor = (sampleType: string): string => {
  return sampleTypeColors[sampleType.toLowerCase()] || '#ff0000';
}; 