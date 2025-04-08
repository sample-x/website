'use client'

import { useState, useEffect } from 'react'
import { Sample } from '@/types/sample'
import dynamic from 'next/dynamic'
import { isStaticExport } from '@/app/lib/staticData'
import { SamplesMapProps } from './mapTypes'

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mb-2"></div>
        <p>Loading map...</p>
      </div>
    </div>
  )
})

// Sample type colors for markers
const typeColors: Record<string, string> = {
  animal: '#ef4444',
  plant: '#65a30d',
  mineral: '#3b82f6',
  synthetic: '#8b5cf6',
  bacterial: '#10b981',
  'cell line': '#8b5cf6',
  environmental: '#3b82f6',
  soil: '#92400e',
  viral: '#db2777',
  default: '#6b7280',
}

export default function SamplesMap({ samples, onSampleSelect, selectedSample }: SamplesMapProps) {
  const [markers, setMarkers] = useState<any[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09])
  const [mapZoom, setMapZoom] = useState(2)
  const [isMounted, setIsMounted] = useState(false)

  // Check for client-side rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!samples || samples.length === 0 || !isMounted) {
      return
    }

    console.log('SamplesMap: Processing samples for map:', samples.length);

    // Filter samples with valid coordinates
    const filteredSamples = samples.filter(
      (sample) => typeof sample.latitude === 'number' && 
                 typeof sample.longitude === 'number' && 
                 !isNaN(sample.latitude) && 
                 !isNaN(sample.longitude)
    );

    console.log('SamplesMap: Filtered samples with coordinates:', filteredSamples.length);

    if (filteredSamples.length > 0) {
      // Create markers
      const newMarkers = filteredSamples.map((sample) => {
        console.log(`Creating marker for sample ${sample.id} at [${sample.latitude}, ${sample.longitude}]`);
        return {
          position: [sample.latitude, sample.longitude] as [number, number],
          popup: createPopupContent(sample),
          sampleType: sample.type,
          sampleId: sample.id,
          onClick: () => {
            if (onSampleSelect) onSampleSelect(sample);
          },
        };
      });

      setMarkers(newMarkers);
      console.log('SamplesMap: Set markers:', newMarkers.length);

      // Calculate center and zoom
      if (newMarkers.length === 1) {
        setMapCenter([filteredSamples[0].latitude!, filteredSamples[0].longitude!]);
        setMapZoom(13);
      } else if (newMarkers.length > 1) {
        // Calculate the average center for multiple points
        const avgLat = filteredSamples.reduce((sum, s) => sum + (s.latitude || 0), 0) / filteredSamples.length;
        const avgLng = filteredSamples.reduce((sum, s) => sum + (s.longitude || 0), 0) / filteredSamples.length;
        setMapCenter([avgLat, avgLng]);
        setMapZoom(3); // Better zoom level to show multiple points
      }
    }
  }, [samples, onSampleSelect, selectedSample, isMounted]);

  // Skip map rendering in static export mode or before client-side mount
  if (isStaticExport() || !isMounted) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p>Map not available in static mode</p>
          <p className="text-sm text-gray-500 mt-2">
            {samples?.length || 0} sample locations would be shown here
          </p>
        </div>
      </div>
    );
  }

  // Make sure we're passing all necessary props to LeafletMap
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: "400px", minHeight: "400px" }}>
      <LeafletMap 
        markers={markers}
        center={mapCenter} 
        zoom={mapZoom}
        handleSampleSelect={(sampleId) => {
          console.log('Sample selected from map:', sampleId);
          const sample = samples.find(s => s.id === sampleId);
          if (sample && onSampleSelect) onSampleSelect(sample);
        }}
      />
    </div>
  );
}

// Function to get the marker color based on sample type
const getMarkerColor = (type?: string): string => {
  if (!type) return typeColors.default;
  
  // Convert to lowercase for case-insensitive matching
  const typeLower = type.toLowerCase();
  
  // Check if type is directly in our color map
  for (const [key, color] of Object.entries(typeColors)) {
    if (key === typeLower) return color;
  }
  
  // Check if type contains any of our color keys
  for (const [key, color] of Object.entries(typeColors)) {
    if (typeLower.includes(key)) return color;
  }
  
  // Default color if no match
  return typeColors.default;
};

function createPopupContent(sample: Sample): string {
  const price = sample.price ? `$${sample.price.toFixed(2)}` : 'N/A';
  const typeColor = getMarkerColor(sample.type);
  
  return `
    <div class="sample-popup p-3">
      <h3 class="font-bold text-lg mb-2">${sample.name}</h3>
      
      <div class="mb-2">
        <span class="inline-block px-2 py-1 text-xs font-medium rounded-full" 
              style="background-color: ${typeColor}20; color: ${typeColor}; border: 1px solid ${typeColor}">
          ${sample.type || 'Unknown'}
        </span>
      </div>
      
      <div class="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <span class="font-medium">Location:</span>
          <p>${sample.location || 'Unknown'}</p>
        </div>
        
        <div>
          <span class="font-medium">Price:</span>
          <p>${price}</p>
        </div>
      </div>
      
      <button 
        onclick="window.leafletSelectSample('${sample.id}')" 
        class="w-full bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        View Details
      </button>
    </div>
  `;
}
