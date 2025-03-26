'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Sample } from '@/types/sample';
import dynamic from 'next/dynamic';
import './samples.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCartPlus, faFlask, faFileAlt, faUpload } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

// Import map component dynamically to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sample type colors
const sampleTypeColors: { [key: string]: string } = {
  'bacterial': '#e74c3c',
  'viral': '#9b59b6',
  'fungal': '#2ecc71',
  'tissue': '#f39c12',
  'environmental': '#3498db',
  'cell line': '#8b5cf6',
  'soil': '#92400e',
  'botanical': '#65a30d',
  'dna': '#7c3aed',
  'water': '#0ea5e9',
  'industrial': '#64748b',
  'default': '#95a5a6'
};

interface SampleDetailsModalProps {
  sample: Sample | null;
  onClose: () => void;
  onAddToCart: (sample: Sample) => void;
}

const SampleDetailsModal = ({ sample, onClose, onAddToCart }: SampleDetailsModalProps) => {
  if (!sample) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{sample.name}</h2>
        <div className="modal-body">
          <div className="sample-info">
            <p><strong>Type:</strong> {sample.type}</p>
            <p><strong>Location:</strong> {sample.location}</p>
            <p><strong>Collection Date:</strong> {sample.collection_date}</p>
            <p><strong>Storage:</strong> {sample.storage_condition}</p>
            <p><strong>Price:</strong> {sample.price ? `$${sample.price.toFixed(2)}` : 'N/A'}</p>
            <p><strong>Description:</strong> {sample.description}</p>
          </div>
          <div className="modal-actions">
            <button className="action-button add" onClick={() => onAddToCart(sample)}>
              <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
            </button>
            <button className="action-button specs">
              <FontAwesomeIcon icon={faFlask} /> Cultivation Specs
            </button>
            <button className="action-button safety">
              <FontAwesomeIcon icon={faFileAlt} /> Safety Sheet
            </button>
          </div>
        </div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [mapBounds, setMapBounds] = useState<any>(null);
  const samplesPerPage = 10;

  // Fetch samples on component mount
  useEffect(() => {
    const fetchSamples = async () => {
      const { data, error } = await supabase
        .from('samples')
        .select('*');

      if (error) {
        console.error('Error fetching samples:', error);
        return;
      }

      setSamples(data || []);
    };

    fetchSamples();
  }, []);

  // Filter samples based on search term and type
  const filteredSamples = samples.filter(sample => {
    const matchesSearch = searchTerm === '' || 
      sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sample.description && sample.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === '' || sample.type.toLowerCase() === selectedType.toLowerCase();

    const matchesBounds = !mapBounds || (
      sample.latitude &&
      sample.longitude &&
      sample.latitude >= mapBounds.getSouth() &&
      sample.latitude <= mapBounds.getNorth() &&
      sample.longitude >= mapBounds.getWest() &&
      sample.longitude <= mapBounds.getEast()
    );

    return matchesSearch && matchesType && matchesBounds;
  });

  const totalPages = Math.ceil(filteredSamples.length / samplesPerPage);
  const currentSamples = filteredSamples.slice(
    (currentPage - 1) * samplesPerPage,
    currentPage * samplesPerPage
  );

  const handleMapBoundsChange = (bounds: any) => {
    setMapBounds(bounds);
    setCurrentPage(1);
  };

  const handleViewDetails = (sample: Sample) => {
    setSelectedSample(sample);
  };

  const handleAddToCart = (sample: Sample) => {
    // Implement add to cart functionality
    alert(`Added ${sample.name} to cart!`);
  };

  return (
    <main className="samples-page">
      <div className="samples-hero">
        <h1>Browse Samples</h1>
        <p>Discover and browse scientific samples from researchers around the world.</p>
        <Link href="/samples/upload" className="upload-link">
          <FontAwesomeIcon icon={faUpload} /> Upload Samples
        </Link>
      </div>

      <div className="samples-container">
        {/* Search and Filter Controls */}
        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search samples..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="type-filter">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              {Object.keys(sampleTypeColors).map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="results-count">
          Showing {filteredSamples.length} samples
        </div>

        {/* Samples Table */}
        <div className="samples-layout">
          <div className="samples-list">
            <table className="samples-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Collection Date</th>
                  <th>Storage</th>
                  <th>Quantity</th>
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
                        <span 
                          className="type-indicator" 
                          style={{ 
                            backgroundColor: sampleTypeColors[sample.type.toLowerCase()] || sampleTypeColors.default 
                          }}
                        ></span>
                        {sample.type}
                      </div>
                    </td>
                    <td>{sample.location}</td>
                    <td>{sample.collection_date ? new Date(sample.collection_date).toLocaleDateString() : 'N/A'}</td>
                    <td>{sample.storage_condition}</td>
                    <td>{typeof sample.quantity === 'number' ? (sample.quantity > 0 ? sample.quantity : 'Out of Stock') : 'N/A'}</td>
                    <td>{typeof sample.price === 'number' ? `$${sample.price.toFixed(2)}` : 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-button info"
                          onClick={() => handleViewDetails(sample)}
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                        <button 
                          className="action-button cart"
                          onClick={() => handleAddToCart(sample)}
                          title="Add to Cart"
                          disabled={!sample.quantity || sample.quantity <= 0}
                        >
                          <FontAwesomeIcon icon={faCartPlus} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="current-page">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="map-section">
            <h2>Sample Locations</h2>
            <div className="map-container">
              <Map 
                samples={filteredSamples} 
                onBoundsChange={handleMapBoundsChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sample Details Modal */}
      {selectedSample && (
        <SampleDetailsModal
          sample={selectedSample}
          onClose={() => setSelectedSample(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </main>
  );
}
