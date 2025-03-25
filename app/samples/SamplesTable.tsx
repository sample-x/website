'use client'

import { useState } from 'react'

// Sample type definition
interface Sample {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  price: number;
  coordinates?: [number, number];
  collectionDate?: string;
  storageCondition?: string;
  availability: string;
  inStock?: boolean;
}

interface SamplesTableProps {
  samples: Sample[];
  onSampleSelect?: (sample: Sample) => void;
  onAddToCart?: (sample: Sample) => void;
}

// Define color mapping for sample types
const typeColors: Record<string, string> = {
  'bacterial': '#8BC34A',
  'tissue': '#E91E63',
  'cell line': '#E91E63',
  'environmental': '#795548',
  'ice core': '#B3E5FC',
  default: '#757575'
};

// Get color based on sample type
const getSampleColor = (type: string): string => {
  if (!type) return typeColors.default;
  
  const normalizedType = type.toLowerCase();
  
  // Try exact match first
  if (typeColors[normalizedType]) {
    return typeColors[normalizedType];
  }
  
  // Try partial matches
  for (const [key, color] of Object.entries(typeColors)) {
    if (key !== 'default' && normalizedType.includes(key)) {
      return color;
    }
  }
  
  return typeColors.default;
};

export default function SamplesTable({ samples, onSampleSelect, onAddToCart }: SamplesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const samplesPerPage = 5;

  // Calculate pagination indexes
  const indexOfLastSample = currentPage * samplesPerPage;
  const indexOfFirstSample = indexOfLastSample - samplesPerPage;
  const currentSamples = samples.slice(indexOfFirstSample, indexOfLastSample);
  const totalPages = Math.ceil(samples.length / samplesPerPage);

  // Pagination navigation
  const goToNextPage = () => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(page => Math.max(page - 1, 1));
  };

  const getAvailabilityClass = (availability?: string): string => {
    if (!availability) return 'unknown';
    
    switch (availability.toLowerCase()) {
      case 'available':
        return 'available';
      case 'limited':
        return 'limited';
      case 'out_of_stock':
        return 'out';
      default:
        return 'unknown';
    }
  };

  const formatPrice = (price?: number): string => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="samples-table-wrapper">
      <h2>Available Samples ({samples.length})</h2>
      
      {samples.length === 0 ? (
        <div className="no-samples">
          <p>No samples found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="samples-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Collection Date</th>
                  <th>Storage</th>
                  <th>Availability</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSamples.map((sample) => (
                  <tr key={sample.id}>
                    <td>{sample.name}</td>
                    <td>
                      <div className="sample-type">
                        <div 
                          className="type-color" 
                          style={{ backgroundColor: getSampleColor(sample.type) }}
                        ></div>
                        {sample.type}
                      </div>
                    </td>
                    <td>{sample.location || 'N/A'}</td>
                    <td>{formatDate(sample.collectionDate)}</td>
                    <td>{sample.storageCondition || 'N/A'}</td>
                    <td>
                      <span className={`availability ${getAvailabilityClass(sample.availability)}`}>
                        {sample.availability}
                      </span>
                    </td>
                    <td>{formatPrice(sample.price)}</td>
                    <td className="action-buttons">
                      <button 
                        className="btn-details"
                        onClick={() => onSampleSelect && onSampleSelect(sample)}
                        title="View details"
                      >
                        Details
                      </button>
                      <button 
                        className="btn-add-cart"
                        onClick={() => onAddToCart && onAddToCart(sample)}
                        disabled={!sample.inStock}
                        title="Add to cart"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={goToPrevPage} 
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
