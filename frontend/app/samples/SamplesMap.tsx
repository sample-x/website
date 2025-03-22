'use client'

import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Sample } from './types'

// Define colors for different sample types
const typeColors: Record<string, string> = {
  'water': '#2196F3',      // Blue
  'soil': '#8B4513',       // Brown
  'air': '#90CAF9',        // Light Blue
  'ice': '#B3E5FC',        // Very Light Blue
  'industrial bacteria': '#8BC34A', // Light Green
  'cell line': '#E91E63',  // Pink
  'environmental sample': '#795548', // Brown
  'water sample': '#2196F3', // Blue
  'virus': '#9C27B0',      // Purple
  'dna sample': '#673AB7', // Deep Purple
  'biological': '#4CAF50', // Green
  'chemical': '#9C27B0',   // Purple
  'physical': '#FF9800',   // Orange
  'digital': '#607D8B',    // Gray
  'equipment': '#F44336',  // Red
  'tissue': '#E91E63',     // Pink
  'cell': '#8BC34A',       // Light Green
  'dna': '#673AB7',        // Deep Purple
  'rna': '#3F51B5',        // Indigo
  'protein': '#00BCD4',    // Cyan
  'other': '#795548'       // Dark Brown
}

// Default color for unknown types
const defaultColor = '#607D8B'

// Function to determine color based on sample type
const getSampleColor = (sampleType: string): string => {
  if (!sampleType) return defaultColor;
  
  const lowerType = sampleType.toLowerCase();
  
  // Direct match - using safer hasOwnProperty check
  if (Object.prototype.hasOwnProperty.call(typeColors, lowerType)) {
    return typeColors[lowerType as keyof typeof typeColors];
  }
  
  // Partial match
  for (const [key, color] of Object.entries(typeColors)) {
    if (lowerType.includes(key)) {
      return color;
    }
  }
  
  return defaultColor;
}

interface SamplesMapProps {
  samples: Sample[];
}

const SamplesMap: React.FC<SamplesMapProps> = ({ samples }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This is a placeholder for map initialization
    // In a real app, you would use a mapping library like Leaflet, Google Maps, etc.
    if (mapRef.current) {
      const mapElement = mapRef.current;
      mapElement.innerHTML = '';

      // Simple map representation for demo purposes
      const mapContainer = document.createElement('div');
      mapContainer.className = 'mock-map';
      mapContainer.style.height = '400px';
      mapContainer.style.backgroundColor = '#e0e0e0';
      mapContainer.style.padding = '15px';
      mapContainer.style.borderRadius = '8px';

      const mapTitle = document.createElement('h3');
      mapTitle.textContent = 'Sample Locations Map';
      mapContainer.appendChild(mapTitle);

      const mapDescription = document.createElement('p');
      mapDescription.textContent = `Displaying ${samples.length} sample locations`;
      mapContainer.appendChild(mapDescription);

      // Create simple markers for each sample
      samples.forEach(sample => {
        if (sample.latitude && sample.longitude) {
          const marker = document.createElement('div');
          marker.className = 'map-marker';
          marker.style.padding = '8px';
          marker.style.margin = '5px 0';
          marker.style.backgroundColor = '#fff';
          marker.style.borderRadius = '4px';
          marker.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
          
          marker.innerHTML = `
            <strong>${sample.name}</strong><br>
            Location: ${sample.location}<br>
            Coordinates: ${sample.latitude}, ${sample.longitude}
          `;
          
          mapContainer.appendChild(marker);
        }
      });

      mapElement.appendChild(mapContainer);
    }
  }, [samples]);

  return (
    <div className="samples-map" ref={mapRef}>
      <div className="loading-map">Loading map...</div>
    </div>
  );
};

export default SamplesMap; 