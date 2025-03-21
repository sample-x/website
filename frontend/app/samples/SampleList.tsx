import Link from 'next/link';
import { useState } from 'react';

// Updated Sample interface with all needed properties
interface Sample {
  id: number;
  name: string;
  type: string;
  location: string;
  availability: string;
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

const SampleList = ({ samples }: SampleListProps) => {
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
      {/* Samples from props */}
      {samples.map((sample) => (
        <div className="sample-card" key={sample.id}>
          <div className="sample-header">
            <h3>{sample.name}</h3>
            <span className={`type-badge ${sample.type.toLowerCase().replace(/\s+/g, '-')}`}>
              {sample.type}
            </span>
          </div>
          {sample.description && (
            <p className="sample-description">{sample.description}</p>
          )}
          <div className="sample-details">
            {sample.price !== undefined && (
              <p><strong>Price:</strong> ${sample.price.toFixed(2)}</p>
            )}
            {sample.quantity !== undefined && sample.unit && (
              <p><strong>Quantity:</strong> {sample.quantity} {sample.unit}</p>
            )}
            <p><strong>Provider:</strong> {sample.provider}</p>
            <p><strong>Host:</strong> {sample.host || getHostInfo(sample)}</p>
            <p><strong>Location:</strong> {sample.locationName || getLocationName(sample)}</p>
          </div>
          <div className="sample-actions">
            <Link href={`/samples/${sample.id}`} className="btn btn-primary btn-small">
              View Details
            </Link>
            <button className="btn btn-secondary btn-small">Add to Cart</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SampleList; 