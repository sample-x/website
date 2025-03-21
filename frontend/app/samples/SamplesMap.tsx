'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

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

// Define the sample interface to match page.tsx
interface Sample {
  id: number;
  name: string;
  type: string;
  location: string;
  availability?: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  provider?: string;
  host?: string;
  locationName?: string;
  coordinates?: [number, number];
  // Additional properties for map functionality
  latitude?: number;
  longitude?: number;
}

interface SamplesMapProps {
  samples: Sample[];
}

export default function SamplesMap({ samples }: SamplesMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) {
    return <div className="samples-map-placeholder">Loading map...</div>
  }
  
  // Get unique sample types from the data
  const uniqueTypes = Array.from(new Set(samples.map(sample => sample.type)));
  
  // Ensure all samples have proper location data
  const validSamples = samples.filter(sample => {
    // Check if sample has coordinates
    if (sample.coordinates && sample.coordinates.length === 2) {
      return true;
    }
    
    // Check if sample has latitude/longitude properties
    if (sample.latitude !== undefined && sample.longitude !== undefined) {
      return true;
    }
    
    // Try to parse coordinates from location string (if format is "lat,lng")
    try {
      if (sample.location && sample.location.includes(',')) {
        const [lat, lng] = sample.location.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          return true;
        }
      }
    } catch (e) {
      // Parsing failed, consider this sample invalid for mapping
    }
    
    return false;
  });
  
  return (
    <div className="samples-map">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          className="grayscale-tiles"
        />
        
        {validSamples.map((sample) => {
          // Get coordinates from various possible sources
          let lat: number | undefined;
          let lng: number | undefined;
          
          if (sample.coordinates && sample.coordinates.length === 2) {
            [lat, lng] = sample.coordinates;
          } else if (sample.latitude !== undefined && sample.longitude !== undefined) {
            lat = sample.latitude;
            lng = sample.longitude;
          } else if (sample.location && sample.location.includes(',')) {
            try {
              const parts = sample.location.split(',').map(Number);
              if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                [lat, lng] = parts;
              }
            } catch (e) {
              // Parsing failed, skip this sample
              return null;
            }
          }
          
          if (!lat || !lng) return null;
          
          return (
            <CircleMarker 
              key={sample.id}
              center={[lat, lng]}
              radius={8}
              pathOptions={{ 
                fillColor: getSampleColor(sample.type),
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div className="sample-popup">
                  <h3>{sample.name}</h3>
                  <p><strong>Type:</strong> <span className={`type-badge ${sample.type.toLowerCase().replace(/\s+/g, '-')}`}>{sample.type}</span></p>
                  {sample.description && <p><strong>Description:</strong> {sample.description}</p>}
                  {sample.price && <p><strong>Price:</strong> ${typeof sample.price === 'string' ? parseFloat(sample.price).toFixed(2) : sample.price.toFixed(2)}</p>}
                  {sample.quantity && <p><strong>Quantity:</strong> {sample.quantity} {sample.unit}</p>}
                  {sample.provider && <p><strong>Provider:</strong> {sample.provider}</p>}
                  {sample.host && <p><strong>Host:</strong> {sample.host}</p>}
                  {sample.locationName && <p><strong>Location:</strong> {sample.locationName}</p>}
                  <button className="btn btn-primary btn-small">View Details</button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      <div className="map-legend">
        <h4>Sample Types</h4>
        <div className="legend-items">
          {uniqueTypes.map(type => (
            <div key={type} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: getSampleColor(type) }}></span>
              <span>{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 