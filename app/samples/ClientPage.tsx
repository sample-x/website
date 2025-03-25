'use client';

import SampleMap from '../components/SampleMap';
import { useState, useCallback, useEffect } from 'react';
import { Sample } from '../types/sample';
import { FaList, FaThLarge, FaInfoCircle, FaCartPlus } from 'react-icons/fa';
import './samples.css';

interface PopupInfo {
  isOpen: boolean;
  sample: Sample | null;
}

// Sample data
const samples: Sample[] = [
  {
    id: "1",
    name: "Human Blood Plasma",
    type: "tissue",
    location: "Seattle, WA",
    collection_date: "2023-05-14",
    storage: "-80°C",
    availability: "available",
    price: 120.00,
    latitude: 47.6062,
    longitude: -122.3321,
    description: "Fresh human blood plasma sample",
    inStock: true,
    user_id: "system",
    created_at: "2023-05-14T00:00:00Z"
  },
  {
    id: "2",
    name: "Mouse Brain Tissue",
    type: "tissue",
    location: "Boston, MA",
    collection_date: "2023-04-19",
    storage: "Room temperature (fixed)",
    availability: "limited",
    price: 180.00,
    latitude: 42.3601,
    longitude: -71.0589,
    description: "Fixed mouse brain tissue sample",
    inStock: true,
    user_id: "system",
    created_at: "2023-04-19T00:00:00Z"
  },
  {
    id: "3",
    name: "E. coli Culture",
    type: "bacterial",
    location: "Chicago, IL",
    collection_date: "2023-05-31",
    storage: "4°C",
    availability: "available",
    price: 75.00,
    latitude: 41.8781,
    longitude: -87.6298,
    description: "E. coli culture sample",
    inStock: true,
    user_id: "system",
    created_at: "2023-05-31T00:00:00Z"
  },
  {
    id: "4",
    name: "Soil Sample from Amazon Rainforest",
    type: "environmental",
    location: "Manaus, Brazil",
    collection_date: "2023-03-09",
    storage: "Room temperature",
    availability: "available",
    price: 95.00,
    latitude: -3.1190,
    longitude: -60.0217,
    description: "Soil sample from the Amazon rainforest",
    inStock: true,
    user_id: "system",
    created_at: "2023-03-09T00:00:00Z"
  },
  {
    id: "5",
    name: "Human Lung Cell Line",
    type: "cell line",
    location: "San Francisco, CA",
    collection_date: "2023-05-04",
    storage: "Liquid nitrogen",
    availability: "limited",
    price: 210.00,
    latitude: 37.7749,
    longitude: -122.4194,
    description: "Human lung cell line sample",
    inStock: true,
    user_id: "system",
    created_at: "2023-05-04T00:00:00Z"
  }
];

// Define the sample types and their colors
const sampleTypes = [
  { id: 'bacterial', name: 'Bacterial', color: '#10b981' },
  { id: 'tissue', name: 'Tissue', color: '#ef4444' },
  { id: 'cell line', name: 'Cell Line', color: '#8b5cf6' },
  { id: 'environmental', name: 'Environmental', color: '#3b82f6' },
  { id: 'soil', name: 'Soil', color: '#92400e' },
  { id: 'botanical', name: 'Botanical', color: '#65a30d' },
  { id: 'viral', name: 'Viral', color: '#db2777' },
  { id: 'dna', name: 'DNA', color: '#7c3aed' },
  { id: 'water', name: 'Water Sample', color: '#0ea5e9' },
  { id: 'industrial', name: 'Industrial Strain', color: '#64748b' },
];

export default function ClientPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [visibleSamples, setVisibleSamples] = useState(samples);
  const [popupInfo, setPopupInfo] = useState<PopupInfo>({ isOpen: false, sample: null });
  const [activeView, setActiveView] = useState('list');
  const [activeSampleTypes, setActiveSampleTypes] = useState<string[]>([]);
  const [filteredMapSamples, setFilteredMapSamples] = useState(samples);

  // Callback for when map bounds change
  const handleMapBoundsChange = useCallback((visibleSampleIds: string[]) => {
    const filtered = samples.filter(sample => visibleSampleIds.includes(sample.id));
    setVisibleSamples(filtered);
  }, []);

  // Filter samples when search or filter criteria change
  useEffect(() => {
    let filtered = samples;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sample => 
        sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (selectedType !== 'All Types') {
      filtered = filtered.filter(sample => 
        sample.type.toLowerCase() === selectedType.toLowerCase()
      );
    }
    
    // Apply price range filter
    filtered = filtered.filter(sample => 
      sample.price >= priceRange.min && sample.price <= priceRange.max
    );

    setVisibleSamples(filtered);
  }, [searchTerm, selectedType, priceRange]);

  // Filter map samples when active sample types change
  useEffect(() => {
    if (activeSampleTypes.length === 0) {
      setFilteredMapSamples(samples);
    } else {
      const filtered = samples.filter(sample => 
        activeSampleTypes.includes(sample.type.toLowerCase())
      );
      setFilteredMapSamples(filtered);
    }
  }, [activeSampleTypes]);

  // Toggle sample type in the filter
  const toggleSampleType = (type: string) => {
    if (activeSampleTypes.includes(type)) {
      setActiveSampleTypes(activeSampleTypes.filter(t => t !== type));
    } else {
      setActiveSampleTypes([...activeSampleTypes, type]);
    }
  };

  return (
    <main className="samples-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>Browse Samples</h1>
          <p>Discover and browse scientific samples from researchers around the world.</p>
        </div>

        {/* Search and Filters */}
        <div className="search-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search samples..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <div className="filter-control">
              <label>Sample Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option>All Types</option>
                {sampleTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-control">
              <label>Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                />
                <span>to</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="view-controls">
          <button
            className={activeView === 'list' ? 'active' : ''}
            onClick={() => setActiveView('list')}
          >
            <FaList /> List View
          </button>
          <button
            className={activeView === 'grid' ? 'active' : ''}
            onClick={() => setActiveView('grid')}
          >
            <FaThLarge /> Grid View
          </button>
        </div>

        {/* Samples Table */}
        <div className="samples-table">
          <table>
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
              {visibleSamples.map((sample) => (
                <tr key={sample.id}>
                  <td>{sample.name}</td>
                  <td>
                    <div className="sample-type">
                      <span 
                        className={`type-indicator ${sample.type.toLowerCase().replace(' ', '-')}`}
                      ></span>
                      {sample.type}
                    </div>
                  </td>
                  <td>{sample.location}</td>
                  <td>{sample.collection_date}</td>
                  <td>{sample.storage}</td>
                  <td>
                    <span className={`availability-badge ${sample.availability}`}>
                      {sample.availability}
                    </span>
                  </td>
                  <td className="price">${sample.price.toFixed(2)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-button details"
                        onClick={() => setPopupInfo({ isOpen: true, sample })}
                        title="View Details"
                      >
                        <FaInfoCircle />
                      </button>
                      <button 
                        className="action-button add"
                        title="Add to Cart"
                        onClick={() => alert(`Added ${sample.name} to cart!`)}
                      >
                        <FaCartPlus />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button disabled>Previous</button>
          <span className="current-page">Page 1 of 1</span>
          <button disabled>Next</button>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <h2>Sample Locations</h2>
          <div className="map-container">
            <SampleMap 
              samples={filteredMapSamples} 
              onBoundsChange={handleMapBoundsChange}
            />
            
            {/* Custom Map Legend with Filtering */}
            <div className="map-legend">
              <div className="legend-title">Sample Types</div>
              <div className="legend-items">
                {sampleTypes.map(type => (
                  <div 
                    key={type.id}
                    className={`legend-item ${activeSampleTypes.includes(type.id) ? 'active' : ''}`}
                    onClick={() => toggleSampleType(type.id)}
                  >
                    <span 
                      className="legend-color"
                      style={{ backgroundColor: type.color }}
                    ></span>
                    {type.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Details Modal */}
      {popupInfo.isOpen && popupInfo.sample && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{popupInfo.sample.name}</h2>
              <button 
                className="modal-close"
                onClick={() => setPopupInfo({ isOpen: false, sample: null })}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="sample-detail-grid">
                <div className="detail-label">Type:</div>
                <div className="detail-value">
                  <div className="sample-type">
                    <span 
                      className={`type-indicator ${popupInfo.sample.type.toLowerCase().replace(' ', '-')}`}
                    ></span>
                    {popupInfo.sample.type}
                  </div>
                </div>
                
                <div className="detail-label">Location:</div>
                <div className="detail-value">{popupInfo.sample.location}</div>
                
                <div className="detail-label">Collection Date:</div>
                <div className="detail-value">{popupInfo.sample.collection_date}</div>
                
                <div className="detail-label">Storage:</div>
                <div className="detail-value">{popupInfo.sample.storage}</div>
                
                <div className="detail-label">Availability:</div>
                <div className="detail-value">
                  <span className={`availability-badge ${popupInfo.sample.availability}`}>
                    {popupInfo.sample.availability}
                  </span>
                </div>
                
                <div className="detail-label">Price:</div>
                <div className="detail-value price">${popupInfo.sample.price.toFixed(2)}</div>
                
                <div className="detail-label">Description:</div>
                <div className="detail-value">{popupInfo.sample.description}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  alert(`Added ${popupInfo.sample?.name} to cart!`);
                  setPopupInfo({ isOpen: false, sample: null });
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 