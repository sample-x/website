'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Sample } from '@/types/sample';
import { Map as LeafletMap } from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';

// Sample type colors
const sampleTypeColors: { [key: string]: string } = {
  'bacterial': '#e74c3c',
  'viral': '#9b59b6',
  'fungal': '#2ecc71',
  'tissue': '#f39c12',
  'environmental': '#3498db',
  'cell line': '#8b5cf6',
  'soil': '#92400e',
  'botanical': '#65a30d',
  'dna': '#7c3aed',
  'water': '#0ea5e9',
  'industrial': '#64748b',
  'default': '#95a5a6'
};

function getMarkerColor(type: string): string {
  return sampleTypeColors[type.toLowerCase()] || sampleTypeColors.default;
}

interface MapProps {
  samples: Sample[];
  onBoundsChange: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
}

function MapEventHandler({ onBoundsChange }: { onBoundsChange: MapProps['onBoundsChange'] }) {
  const map = useMap();
  
  map.on('moveend', () => {
    const bounds = map.getBounds();
    onBoundsChange({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
  });

  return null;
}

const Map = ({ samples, onBoundsChange }: MapProps) => {
  const getMarkerColor = (type: string) => {
    return sampleTypeColors[type.toLowerCase()] || sampleTypeColors.default;
  };

  // Get unique sample types for the legend
  const uniqueTypes = Array.from(new Set(samples.map(sample => sample.type.toLowerCase())));

  return (
    <div className="relative">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '500px', width: '100%' }}
        className="rounded-lg"
      >
        <MapEventHandler onBoundsChange={onBoundsChange} />
        <TileLayer
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
        />
        {samples.map((sample) => {
          if (!sample.latitude || !sample.longitude) return null;
          return (
            <CircleMarker
              key={sample.id}
              center={[sample.latitude, sample.longitude]}
              radius={8}
              fillColor={getMarkerColor(sample.type)}
              color="white"
              weight={2}
              opacity={1}
              fillOpacity={0.8}
            >
              <Popup>
                <div className="sample-popup">
                  <h3>{sample.name}</h3>
                  <p><strong>Type:</strong> {sample.type}</p>
                  <p><strong>Location:</strong> {sample.location}</p>
                  <p><strong>Collection Date:</strong> {sample.collection_date ? new Date(sample.collection_date).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Storage:</strong> {sample.storage_condition}</p>
                  <p><strong>Quantity:</strong> {typeof sample.quantity === 'number' ? (sample.quantity > 0 ? sample.quantity : 'Out of Stock') : 'N/A'}</p>
                  <p><strong>Price:</strong> {typeof sample.price === 'number' ? `$${sample.price.toFixed(2)}` : 'N/A'}</p>
                  {sample.description && <p><strong>Description:</strong> {sample.description}</p>}
                  <div className="popup-actions">
                    <button 
                      className="action-button add"
                      onClick={() => {
                        // TODO: Implement add to cart functionality
                        console.log('Add to cart:', sample);
                      }}
                    >
                      <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
                    </button>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-title">Sample Types</div>
        <div className="legend-items">
          {uniqueTypes.map(type => (
            <div key={type} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: sampleTypeColors[type] || sampleTypeColors.default }}
              />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Map; 