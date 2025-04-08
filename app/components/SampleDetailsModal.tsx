'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Sample } from '@/types/sample';
import { sampleTypeColors } from '@/utils/constants';
import { SampleMap } from '@/components/SampleMap';
import StorageSymbol from './StorageSymbol';

interface SampleDetailsModalProps {
  sample: Sample;
  onClose: () => void;
  onAddToCart: (sample: Sample) => void;
}

export default function SampleDetailsModal({ sample, onClose, onAddToCart }: SampleDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="sample-details">
          <h2 className="text-2xl font-bold mb-4">{sample.name}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="detail-item">
              <strong>Type:</strong>
              <div className="sample-type">
                <span 
                  className="type-indicator" 
                  style={{ 
                    backgroundColor: sampleTypeColors[sample.type.toLowerCase()] || sampleTypeColors.default 
                  }}
                ></span>
                {sample.type}
              </div>
            </div>

            <div className="detail-item">
              <strong>Location:</strong>
              <span>{sample.location}</span>
            </div>

            <div className="detail-item">
              <strong>Price:</strong>
              <span>${sample.price.toFixed(2)}</span>
            </div>

            <div className="detail-item">
              <strong>Collection Date:</strong>
              <span>{sample.collection_date ? new Date(sample.collection_date).toLocaleDateString() : 'N/A'}</span>
            </div>

            <div className="detail-item">
              <strong>Storage Condition:</strong>
              <div className="flex items-center gap-2">
                <StorageSymbol condition={sample.storage_condition || ''} id={`modal-${sample.id}`} />
                <span>{sample.storage_condition || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-item">
              <strong>Availability:</strong>
              <span className={`availability ${sample.inStock ? 'in-stock' : 'out-of-stock'}`}>
                {sample.quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <strong>Description:</strong>
            <p className="mt-2">{sample.description || 'No description available.'}</p>
          </div>

          {typeof sample.latitude === 'number' && typeof sample.longitude === 'number' && (
            <>
              <div className="mt-4">
                <strong>Coordinates:</strong>
                <p className="mt-2">
                  {sample.latitude.toFixed(4)}, {sample.longitude.toFixed(4)}
                </p>
              </div>
              <div className="map-section">
                <h3>Sample Location</h3>
                <div className="modal-map">
                  <SampleMap samples={[sample]} />
                </div>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button
              className="add-to-cart-button"
              onClick={() => onAddToCart(sample)}
              disabled={!sample.inStock}
            >
              <FontAwesomeIcon icon={faCartPlus} />
              {sample.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 