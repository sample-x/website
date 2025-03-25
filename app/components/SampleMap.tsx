'use client';  // Add this at the top

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { Sample } from '../types/sample';
import type { Map } from 'leaflet';
import { FaCartPlus } from 'react-icons/fa';

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
    map.on('load', () => {
      // Initial update
      const bounds = map.getBounds();
      const visibleSamples = samples.filter(sample => 
        bounds.contains([sample.latitude, sample.longitude])
      );
      onBoundsChange(visibleSamples.map(sample => sample.id));
    });
  }, [samples, onBoundsChange]);

  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={2} 
      style={{ height: '500px', width: '100%' }}
      className="z-0"
      ref={mapRef}
    >
      <TileLayer
        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      {samples.map((sample) => (
        <CircleMarker
          key={sample.id}
          center={[sample.latitude, sample.longitude]}
          radius={8}
          pathOptions={{
            fillColor: getMarkerColor(sample.type),
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9
          }}
        >
          <Popup>
            <div className="min-w-[220px] p-2">
              <h3 className="text-lg font-bold mb-2 text-center">{sample.name}</h3>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3">
                <div className="text-sm font-semibold">Type:</div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    <span 
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: getMarkerColor(sample.type) }}
                    ></span>
                    {sample.type}
                  </div>
                </div>
                <div className="text-sm font-semibold">Location:</div>
                <div className="text-sm">{sample.location}</div>
                <div className="text-sm font-semibold">Storage:</div>
                <div className="text-sm">{sample.storage}</div>
                <div className="text-sm font-semibold">Price:</div>
                <div className="text-sm font-medium">${sample.price.toFixed(2)}</div>
                <div className="text-sm font-semibold">Availability:</div>
                <div className="text-sm">
                  <span 
                    className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      sample.availability === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sample.availability}
                  </span>
                </div>
              </div>
              <button 
                className="w-full flex items-center justify-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded text-sm hover:bg-orange-600 transition-colors"
                onClick={() => alert(`Added ${sample.name} to cart!`)}
              >
                <FaCartPlus /> Add to Cart
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
      <BoundsUpdater samples={samples} onChange={onBoundsChange} />
    </MapContainer>
  );
}

// Sample type colors for markers
const sampleTypeColors: { [key: string]: string } = {
  'tissue': '#ef4444',
  'bacterial': '#10b981',
  'cell line': '#8b5cf6',
  'environmental': '#3b82f6',
  'soil': '#92400e',
  'botanical': '#65a30d',
  'viral': '#db2777',
  'dna': '#7c3aed',
  'water sample': '#0ea5e9',
  'industrial strain': '#64748b'
};

const getMarkerColor = (sampleType: string): string => {
  return sampleTypeColors[sampleType.toLowerCase()] || '#888888';
}; 