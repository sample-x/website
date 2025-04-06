'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle, faCartPlus } from '@fortawesome/free-solid-svg-icons'

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

// Helper function to get color for sample type
const getSampleColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    'tissue': '#ef4444',
    'bacterial': '#10b981',
    'cell line': '#8b5cf6',
    'environmental': '#3b82f6',
    'soil': '#92400e',
    'botanical': '#65a30d',
    'viral': '#db2777',
    'dna': '#7c3aed',
    'water sample': '#0ea5e9',
    'industrial strain': '#64748b'
  };
  return colors[type.toLowerCase()] || '#888888';
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
      <h2 className="text-2xl mb-4">Available Samples ({samples.length})</h2>
      
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
                {currentSamples.map(sample => (
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
                        className="action-button details"
                        onClick={() => onSampleSelect && onSampleSelect(sample)}
                        title="View details"
                      >
                        <FontAwesomeIcon icon={faInfoCircle} />
                      </button>
                      <button 
                        className="action-button add"
                        onClick={() => onAddToCart && onAddToCart(sample)}
                        disabled={!sample.inStock}
                        title="Add to cart"
                      >
                        <FontAwesomeIcon icon={faCartPlus} />
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
