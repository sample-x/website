import React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { Sample } from './types';

// Updated Sample interface to match page.tsx definition
interface Sample {
  id: number;
  name: string;
  type: string;
  location: string;
  availability?: string; // Make this optional
  description: string;
  price: number;
  quantity: number;
  unit: string;
  provider?: string;
  host?: string;
  locationName?: string;
  coordinates?: [number, number]; // Add coordinates as an optional property
  // Add any other properties your samples have
}

// Define SampleListProps interface
interface SampleListProps {
  samples: Sample[];
}

const SampleList: React.FC<SampleListProps> = ({ samples }) => {
  const getHostInfo = (sample: Sample) => {
    if (sample.host) return sample.host;
    
    // Default to "Environmental" for certain types
    if (['water', 'soil', 'air'].includes(sample.type.toLowerCase())) {
      return "Environmental";
    }
    
    return "Not specified";
  };

  const getLocationName = (sample: Sample) => {
    if (sample.locationName) return sample.locationName;
    
    // If coordinates aren't available, return the location string
    if (!sample.coordinates) return sample.location;
    
    // Map coordinates to approximate location names
    const locations = {
      'North America': { minLat: 15, maxLat: 72, minLng: -170, maxLng: -50 },
      'South America': { minLat: -60, maxLat: 15, minLng: -90, maxLng: -30 },
      'Europe': { minLat: 35, maxLat: 75, minLng: -10, maxLng: 40 },
      'Africa': { minLat: -40, maxLat: 35, minLng: -20, maxLng: 55 },
      'Asia': { minLat: 0, maxLat: 75, minLng: 40, maxLng: 180 },
      'Australia': { minLat: -50, maxLat: 0, minLng: 110, maxLng: 180 },
      'Antarctica': { minLat: -90, maxLat: -60, minLng: -180, maxLng: 180 }
    };
    
    const [lat, lng] = sample.coordinates;
    
    for (const [name, bounds] of Object.entries(locations)) {
      if (lat >= bounds.minLat && lat <= bounds.maxLat && 
          lng >= bounds.minLng && lng <= bounds.maxLng) {
        return name;
      }
    }
    
    return 'International Waters';
  };

  return (
    <div className="sample-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Location</th>
            <th>Availability</th>
            {/* Add price column if needed */}
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {samples.map(sample => (
            <tr key={sample.id}>
              <td>{sample.name}</td>
              <td>{sample.type}</td>
              <td>{sample.location}</td>
              <td>{sample.availability}</td>
              {/* Display price if available */}
              <td>${sample.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SampleList; 