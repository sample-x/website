'use client';

import React, { useEffect, useRef, useState, FC } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '@/styles/Map.module.css';
import { Sample } from '@/types/sample';
import L from 'leaflet';
import { useRouter } from 'next/navigation';
import { LatLngBounds, Map as LeafletMap } from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

// Sample type colors for markers (ensure this matches expected data types)
export const sampleTypeColors: { [key: string]: string } = {
  'bacterial': '#e74c3c',      // Red (adjusted)
  'viral': '#9b59b6',          // Purple
  'fungal': '#2ecc71',         // Green
  'cell line': '#8b5cf6',    // Violet
  'plant': '#65a30d',          // Lime
  'animal': '#f39c12',         // Orange
  'water': '#0ea5e9',          // Sky Blue
  'soil': '#92400e',          // Brown
  'environmental': '#3498db', // Blue
  'dna': '#7c3aed',            // Indigo
  'industrial': '#64748b',     // Slate
  'default': '#95a5a6'         // Grey (default)
};

// Top-level color getter function
const getMarkerColor = (type: string): string => {
  return sampleTypeColors[type.toLowerCase()] || sampleTypeColors.default;
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
  { type: 'environmental', label: 'Environmental' },
  { type: 'dna', label: 'DNA' }, // Added DNA
  { type: 'industrial', label: 'Industrial' } // Added Industrial
];

// Function to get actually used sample types to display in legend
const getUsedSampleTypes = (samples: Sample[]) => {
  const usedTypes = new Set<string>();
  samples.forEach(sample => {
    if (sample.type) {
      // Ensure consistent lowercase comparison
      usedTypes.add(sample.type.toLowerCase());
    }
  });

  // Filter the predefined sampleTypes list based on used types
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

// Update props to use the imported Sample type
export interface SampleMapProps {
  samples: Sample[]; // Use imported Sample type
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  onTypeFilter?: (type: string | null) => void;
  onSampleSelect?: (sample: Sample) => void; // Use imported Sample type
}

export const SampleMap: FC<SampleMapProps> = ({ samples, onBoundsChange, onTypeFilter, onSampleSelect }) => {
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Move Leaflet icon fix inside useEffect to run only client-side
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
    new LatLngBounds([0, 0], [0, 0]) // Initialize properly
  );

  // Default to world center if no valid samples
  const center = !bounds.isValid() || samples.length === 0 ? [20, 0] as [number, number] : bounds.getCenter();
  const zoom = !bounds.isValid() || samples.length === 0 ? 2 : undefined; // Let fitBounds determine zoom if bounds are valid

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

  // Ensure this uses the correct Sample type
  const handleMarkerClick = (sample: Sample) => {
    if (onSampleSelect) {
      onSampleSelect(sample);
    }
    // Optionally open popup on click
     if (mapRef.current) {
       const markerLatLng = L.latLng(sample.latitude, sample.longitude);
       // Find the corresponding marker layer if needed, or just open a popup at the location
       // This example just opens a new popup, assumes one popup per click
       L.popup({ autoPanPadding: L.point(50, 50) }) // Add padding
         .setLatLng(markerLatLng)
         .setContent(`
           <div class="p-2 max-w-xs"> <!-- Add max width -->
             <h3 class="font-bold text-base mb-1">${sample.name}</h3>
             <p class="text-sm text-gray-600 mb-2 capitalize">${sample.type ? sample.type.charAt(0).toUpperCase() + sample.type.slice(1) : 'N/A'}</p> <!-- Capitalize type -->
             <ul class="list-none text-xs space-y-0.5 mb-2"> <!-- Remove list disc, adjust spacing -->
               <li><span class="font-medium">Location:</span> ${sample.location || 'N/A'}</li>
               ${sample.collection_date ? `<li><span class="font-medium">Collected:</span> ${new Date(sample.collection_date).toLocaleDateString()}</li>` : ''}
               ${sample.storage_condition ? `<li><span class="font-medium">Storage:</span> ${sample.storage_condition}</li>` : ''}
               <li><span class="font-medium">Available:</span> ${sample.quantity > 0 ? sample.quantity : 'Out of Stock'}</li>
               <li><span class="font-medium">Price:</span> $${sample.price ? sample.price.toFixed(2) : 'N/A'}</li>
             </ul>
             <button
               class="mt-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs w-full"
               onclick="window.location.href='/samples/${sample.id}'"
             >
               View Details
             </button>
           </div>
         `)
         .openOn(mapRef.current);
     }
  };

  if (!mounted) {
    return null; // Or a loading placeholder
  }

  // Get used types for the legend based on the *actual* samples passed
  const usedTypesForLegend = getUsedSampleTypes(samples);

  return (
    <div className="map-container relative h-full w-full overflow-hidden rounded-lg">
      <MapContainer
        ref={mapRef} // Assign ref
        center={center}
        zoom={zoom} // Use calculated zoom
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        scrollWheelZoom={true}
        // Use whenReady to access the map instance after creation
        whenReady={() => {
          // Store map instance if needed, though ref is usually sufficient
          // if (mapRef.current) { /* mapRef.current is the instance */ }

          // Use fitBounds only if bounds are valid
          if (mapRef.current && bounds.isValid() && samples.length > 0) {
            mapRef.current.fitBounds(bounds, { padding: [50, 50] }); // Add padding
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="map-tiles-grayscale"
        />

        {samples.map((sample) => {
          // Ensure coordinates are valid numbers before rendering marker
          if (typeof sample.latitude !== 'number' || typeof sample.longitude !== 'number') {
            console.warn(`Skipping sample ${sample.id} due to invalid coordinates:`, sample.latitude, sample.longitude);
            return null;
          }

          // Use the top-level getMarkerColor function
          const markerColor = getMarkerColor(sample.type);

          return (
            <CircleMarker
              key={sample.id}
              center={[sample.latitude, sample.longitude]}
              radius={6}
              pathOptions={{
                // Use the resolved markerColor
                color: markerColor,
                fillColor: markerColor,
                fillOpacity: 0.7,
                weight: 1 // Set consistent weight
              }}
              eventHandlers={{
                click: () => handleMarkerClick(sample), // Use updated handler
                mouseover: (e) => {
                  e.target.setStyle({ fillOpacity: 0.9, radius: 7 }); // Slightly larger on hover
                  e.target.bringToFront();
                },
                mouseout: (e) => {
                  e.target.setStyle({ fillOpacity: 0.7, radius: 6 });
                },
              }}
            >
              {/* Remove the default <Popup> component here, handle popup in handleMarkerClick */}
            </CircleMarker>
          );
        })}
        {/* Add BoundsUpdater if needed */}
        {/* <BoundsUpdater samples={samples} onChange={onBoundsChange} /> */}

      </MapContainer>

       {/* Map Legend - Ensure consistent styling and capitalization */}
      <div className="absolute top-2 right-2 bg-white p-2 rounded shadow-md z-10 max-w-[150px]">
        <div className="font-semibold text-sm mb-1 text-center">Sample Types</div>
        <div className="space-y-1">
          {usedTypesForLegend.map(({ type, label }) => (
            <div key={type} className="flex items-center text-xs cursor-pointer" onClick={() => handleTypeClick(type)}>
              <div
                className="w-3 h-3 rounded-full mr-1.5 border border-gray-300"
                style={{ backgroundColor: sampleTypeColors[type.toLowerCase()] || sampleTypeColors.default }}
              />
              {/* Use the predefined label for consistent capitalization */}
              <span className={`capitalize ${activeFilter === type ? 'font-bold' : ''}`}>{label}</span>
            </div>
          ))}
          {/* Add 'Show All' option */}
           {activeFilter && (
             <div className="flex items-center text-xs cursor-pointer mt-1 pt-1 border-t border-gray-200" onClick={() => handleTypeClick('')}>
               <div
                 className="w-3 h-3 rounded-full mr-1.5 border border-gray-400 bg-transparent"
               />
               <span>Show All</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// Default export if this is the primary component export
// export default SampleMap; 