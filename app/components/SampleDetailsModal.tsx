import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Sample } from '@/types/sample';
import { sampleTypeColors } from '@/utils/constants';
import SampleMap from '@/components/SampleMap';

interface SampleDetailsModalProps {
  sample: Sample;
  onClose: () => void;
  onAddToCart: (sample: Sample) => void;
}

export default function SampleDetailsModal({ sample, onClose, onAddToCart }: SampleDetailsModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="sample-details">
          <h2>{sample.name}</h2>
          
          <div className="details-grid">
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
              <span>{sample.location || 'N/A'}</span>
            </div>

            <div className="detail-item">
              <strong>Collection Date:</strong>
              <span>{sample.collection_date ? new Date(sample.collection_date).toLocaleDateString() : 'N/A'}</span>
            </div>

            <div className="detail-item">
              <strong>Storage Condition:</strong>
              <span>{sample.storage_condition || 'N/A'}</span>
            </div>

            <div className="detail-item">
              <strong>Quantity Available:</strong>
              <span>{typeof sample.quantity === 'number' ? (sample.quantity > 0 ? sample.quantity : 'Out of Stock') : 'N/A'}</span>
            </div>

            <div className="detail-item">
              <strong>Price:</strong>
              <span>{typeof sample.price === 'number' ? `$${sample.price.toFixed(2)}` : 'N/A'}</span>
            </div>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <p>{sample.description || 'No description available.'}</p>
          </div>

          {sample.latitude && sample.longitude && (
            <div className="map-section">
              <h3>Sample Location</h3>
              <div className="modal-map">
                <SampleMap 
                  samples={[sample]}
                  center={{ lat: sample.latitude, lng: sample.longitude }}
                  zoom={8}
                  disableInteraction={true}
                />
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button
              className="add-to-cart-button"
              onClick={() => onAddToCart(sample)}
              disabled={!sample.quantity || sample.quantity <= 0}
            >
              <FontAwesomeIcon icon={faCartPlus} />
              {sample.quantity && sample.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 