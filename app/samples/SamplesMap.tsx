'use client'

import { useState, useEffect } from 'react'
import { Sample } from '@/types/sample'
import dynamic from 'next/dynamic'
import { isStaticExport } from '@/app/lib/staticData'
import { SamplesMapProps } from './mapTypes'
import Image from 'next/image'
import { getSampleTypeColor } from '@/app/lib/sampleColors'

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
const typeColors = {
  bacterial: '#10b981',
  viral: '#db2777',
  fungal: '#f59e0b',
  tissue: '#ef4444',
  environmental: '#3b82f6',
  'cell line': '#8b5cf6',
  soil: '#92400e',
  default: '#64748b',
}

export default function SamplesMap({ samples, onSampleSelect, selectedSample }: SamplesMapProps) {
  const [markers, setMarkers] = useState<any[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09])
  const [mapZoom, setMapZoom] = useState(2)
  const [isMounted, setIsMounted] = useState(false)
  const [isStaticMode, setIsStaticMode] = useState(true)

  // Check for client-side rendering
  useEffect(() => {
    setIsMounted(true)
    setIsStaticMode(isStaticExport())
  }, [])

  useEffect(() => {
    if (!samples || samples.length === 0 || !isMounted) {
      return
    }

    console.log('SamplesMap: Processing samples for map:', samples.length);

    // Filter out samples without valid coordinates
    const filteredSamples = samples.filter(sample => {
      return typeof sample.latitude === 'number' && 
             typeof sample.longitude === 'number' && 
             !isNaN(sample.latitude) && 
             !isNaN(sample.longitude);
    });

    console.log(`SamplesMap: Filtered samples with valid coordinates: ${filteredSamples.length} out of ${samples.length}`);

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

  // Create a static map fallback for static mode
  if (isStaticMode || !isMounted) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
        <div className="text-center relative w-full h-full">
          {/* Use a static map background image */}
          <div className="absolute inset-0 bg-blue-50 opacity-30 z-0"></div>
          
          {/* Static map background pattern */}
          <div className="absolute inset-0 z-0 opacity-20" 
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%2392a6c4\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              backgroundSize: '150px 150px'
            }}>
          </div>

          {/* Sample location markers */}
          {samples.filter(s => s.latitude && s.longitude).map((sample, index) => (
            <div 
              key={index}
              className="absolute w-3 h-3 rounded-full border border-white shadow-sm transform -translate-x-1.5 -translate-y-1.5 cursor-pointer"
              style={{
                backgroundColor: getSampleTypeColor(sample.type) || typeColors.default,
                left: `${((sample.longitude || 0) + 180) / 360 * 100}%`,
                top: `${(90 - (sample.latitude || 0)) / 180 * 100}%`,
                zIndex: 10
              }}
              onClick={() => onSampleSelect?.(sample)}
              title={sample.name}
            />
          ))}

          {/* Overlay with message */}
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-white bg-opacity-80 p-4">
            <div className="text-center max-w-md">
              <h3 className="text-lg font-medium text-gray-900">Map not available in static mode</h3>
              <p className="mt-2 text-sm text-gray-600">
                {samples?.filter(s => s.latitude && s.longitude).length || 0} sample locations would be shown here
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {Object.entries(typeColors).slice(0, 6).map(([type, color]) => (
                  <div key={type} className="flex items-center text-xs text-gray-600">
                    <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: color }}></span>
                    <span className="capitalize truncate">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
  return getSampleTypeColor(type);
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
