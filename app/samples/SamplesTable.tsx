'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle, faCartPlus } from '@fortawesome/free-solid-svg-icons'
import StorageSymbol from '@/app/components/StorageSymbol'
// Import the frontend Sample type (assuming it includes inStock)
import { Sample } from '@/types/sample';
// Import the shared color definitions
import { sampleTypeColors } from '@/components/Map'
import { InformationCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'

export interface SamplesTableProps {
  samples: Sample[];
  onSampleSelect: (sample: Sample) => void;
  onAddToCart: (sample: Sample) => Promise<void>;
  onViewDetails: (sample: Sample) => void;
  loading?: boolean;
  isAuthenticated: boolean;
  isStaticMode?: boolean;
}

// Use the imported color getter
const getSampleColor = (type: string): string => {
  return sampleTypeColors[type.toLowerCase()] || sampleTypeColors.default;
};

// Helper function to lighten hex color (adjust percentage as needed)
const lightenColor = (hex: string, percent: number): string => {
  hex = hex.replace(/^#/, '');
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  const newR = (R < 255 ? R < 1 ? 0 : R : 255).toString(16).padStart(2, '0');
  const newG = (G < 255 ? G < 1 ? 0 : G : 255).toString(16).padStart(2, '0');
  const newB = (B < 255 ? B < 1 ? 0 : B : 255).toString(16).padStart(2, '0');
  return `#${newR}${newG}${newB}`;
};

const capitalize = (s: string) => s && s[0].toUpperCase() + s.slice(1);

export default function SamplesTable({
  samples,
  onSampleSelect,
  onAddToCart,
  onViewDetails,
  loading = false,
  isAuthenticated,
  isStaticMode
}: SamplesTableProps) {
  // Removing internal pagination state and logic - samples are now pre-paginated by parent

  const getAvailabilityClass = (quantity: number): string => {
    if (quantity <= 0) return 'out';
    if (quantity <= 5) return 'limited';
    return 'available';
  };

  const getAvailabilityText = (quantity: number): string => {
    if (quantity <= 0) return 'Out of Stock';
    return `${quantity} available`;
  };

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get color for sample type
  const getTypeColor = (type?: string): string => {
    if (!type) return '#6b7280'; // Default gray
    
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
    };
    
    const typeLower = type.toLowerCase();
    
    // Check if type is directly in color map
    if (typeColors[typeLower]) return typeColors[typeLower];
    
    // Check if type contains any of the keys
    for (const [key, color] of Object.entries(typeColors)) {
      if (typeLower.includes(key)) return color;
    }
    
    return typeColors.default;
  };

  // Format availability text and style
  const getAvailabilityInfo = (quantity?: number) => {
    if (!quantity || quantity <= 0) {
      return {
        text: 'Out of Stock',
        className: 'text-red-600'
      };
    } else if (quantity <= 5) {
      return {
        text: `${quantity} available (limited)`,
        className: 'text-amber-600'
      };
    } else {
      return {
        text: `${quantity} available`,
        className: 'text-green-600'
      };
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Collection Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {samples.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                No samples found matching your criteria.
              </td>
            </tr>
          ) : (
            samples.map((sample) => (
              <tr 
                key={sample.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSampleSelect(sample)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{sample.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span
                      className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      style={{
                        backgroundColor: `${getTypeColor(sample.type)}20`,
                        color: getTypeColor(sample.type),
                        border: `1px solid ${getTypeColor(sample.type)}`
                      }}
                    >
                      {sample.type || 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{sample.location || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(sample.collection_date)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${getAvailabilityInfo(sample.quantity).className}`}>
                    {getAvailabilityInfo(sample.quantity).text}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatPrice(sample.price)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(sample);
                    }}
                    className="text-orange-500 hover:text-orange-700 mr-4"
                    aria-label="View sample details"
                  >
                    <InformationCircleIcon className="h-5 w-5" />
                    <span className="sr-only">View details</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(sample);
                    }}
                    disabled={!sample.inStock}
                    className={
                      sample.inStock
                        ? 'text-orange-500 hover:text-orange-700'
                        : 'text-gray-400 cursor-not-allowed'
                    }
                    aria-label="Add to cart"
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span className="sr-only">{sample.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
