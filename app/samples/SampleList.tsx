'use client'

import React from 'react';
import { Sample } from './types';
import './samples.css';

// Helper function to get host information with fallbacks
const getHostInfo = (sample: Sample): string => {
  if (!sample) return 'Unknown';
  
  if (sample.host) {
    return sample.host;
  }
  
  return 'Not specified';
}

// Helper function to get location info with fallbacks
const getLocationName = (sample: Sample): string => {
  if (!sample) return 'Unknown';
  
  if (sample.location) {
    return sample.location;
  }
  
  if (sample.coordinates && Array.isArray(sample.coordinates) && sample.coordinates.length >= 2) {
    return `Lat: ${sample.coordinates[0].toFixed(2)}, Lng: ${sample.coordinates[1].toFixed(2)}`;
  }
  
  if (sample.latitude !== undefined && sample.longitude !== undefined) {
    const lat = parseFloat(String(sample.latitude));
    const lng = parseFloat(String(sample.longitude));
    if (!isNaN(lat) && !isNaN(lng)) {
      return `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`;
    }
  }
  
  return 'Location unknown';
}

// Helper function to format price with currency symbol
const formatPrice = (price: number | undefined): string => {
  if (price === undefined) return 'Price unavailable';
  return `$${price.toFixed(2)}`;
}

// Helper to determine color for sample type
const getSampleTypeColor = (type: string | undefined): string => {
  if (!type) return '#607D8B'; // Default gray
  
  const typeColors: Record<string, string> = {
    'bacterial': '#8BC34A',
    'tissue': '#E91E63',
    'botanical': '#4CAF50',
    'soil': '#8B4513'
  };
  
  const lowerType = type.toLowerCase();
  
  // Check for exact match
  for (const [key, color] of Object.entries(typeColors)) {
    if (lowerType === key) {
      return color;
    }
  }
  
  // Check for partial match
  for (const [key, color] of Object.entries(typeColors)) {
    if (lowerType.includes(key)) {
      return color;
    }
  }
  
  return '#607D8B'; // Default gray
}

// Define SampleListProps interface
interface SampleListProps {
  samples: Sample[];
}

const SampleList: React.FC<SampleListProps> = ({ samples }) => {
  const handlePurchase = (sample: Sample) => {
    alert(`You are about to purchase: ${sample.name}\nPrice: $${sample.price}`);
    // In a real application, this would open a checkout flow
  };

  if (!samples || !Array.isArray(samples) || samples.length === 0) {
    return (
      <div className="samples-list-container">
        <table className="samples-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Availability</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="no-samples">No samples available</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="samples-list-container">
      <table className="samples-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Location</th>
            <th>Availability</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {samples.map((sample, index) => (
            <tr key={sample.id || index}>
              <td>
                <div className="sample-name">
                  {sample.name}
                  {sample.description && (
                    <div className="tooltip">
                      <span className="info-icon">ℹ️</span>
                      <span className="tooltip-text">{sample.description}</span>
                    </div>
                  )}
                </div>
              </td>
              <td>{sample.type || 'Unknown'}</td>
              <td>{getLocationName(sample)}</td>
              <td>
                <span className={`availability ${sample.availability?.toLowerCase() || 'unknown'}`}>
                  {sample.availability || 'Unknown'}
                </span>
              </td>
              <td>${sample.price || 'Contact for pricing'}</td>
              <td>
                <button 
                  className="btn-purchase"
                  onClick={() => handlePurchase(sample)}
                  disabled={sample.availability === 'Out of Stock'}
                >
                  Purchase
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SampleList; 