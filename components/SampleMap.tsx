'use client';  // Add this at the top

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { Sample } from '../app/types/sample';
import type { Map } from 'leaflet';

interface SampleMapProps {
  samples: Sample[];
  onBoundsChange: (visibleSampleIds: string[]) => void;
}

// BoundsUpdater component to handle map bounds changes
function BoundsUpdater({ samples, onChange }: { samples: Sample[], onChange?: (ids: string[]) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onChange) return;

    const updateVisibleSamples = () => {
      const bounds = map.getBounds();
      const visibleSamples = samples.filter(sample => 
        bounds.contains([sample.latitude, sample.longitude])
      );
      onChange(visibleSamples.map(sample => sample.id));
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
      const visibleSamples = samples.filter(sample => 
        bounds.contains([sample.latitude, sample.longitude])
      );
      onBoundsChange(visibleSamples.map(sample => sample.id));
    };

    map.on('moveend', updateVisibleSamples);
    updateVisibleSamples(); // Initial update

    return () => {
      map.off('moveend', updateVisibleSamples);
    };
  }, [samples, onBoundsChange]);

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
        {samples.map((sample, index) => (
          <CircleMarker
            key={index}
            center={[sample.latitude, sample.longitude]}
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
                  <p><span className="font-semibold">Price:</span> ${sample.price.toFixed(2)}</p>
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
        ))}
        <BoundsUpdater samples={samples} onChange={onBoundsChange} />
        
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