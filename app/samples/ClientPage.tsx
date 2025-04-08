'use client';

import SampleMap from '../components/SampleMap';
import { useState, useCallback, useEffect } from 'react';
import { Sample } from '../types/sample';
import { FaList, FaThLarge, FaInfoCircle, FaCartPlus } from 'react-icons/fa';
import './samples.css';
import { supabase } from '../lib/supabase';

interface PopupInfo {
  isOpen: boolean;
  sample: Sample | null;
}

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
  const [allSamples, setAllSamples] = useState<Sample[]>([]);
  const [visibleSamples, setVisibleSamples] = useState<Sample[]>([]);
  const [popupInfo, setPopupInfo] = useState<PopupInfo>({ isOpen: false, sample: null });
  const [activeView, setActiveView] = useState('list');
  const [activeSampleTypes, setActiveSampleTypes] = useState<string[]>([]);
  const [filteredMapSamples, setFilteredMapSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch samples from Supabase
  useEffect(() => {
    const fetchSamples = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('samples')
        .select('*');

      if (error) {
        console.error('Error fetching samples:', error);
        setIsLoading(false);
        return;
      }

      // Transform the data to ensure it matches the Sample interface
      const transformedSamples: Sample[] = data.map((sample: any) => ({
        id: Number(sample.id),
        name: sample.name,
        type: sample.type,
        location: sample.location || null,
        collection_date: sample.collection_date || null,
        storage: sample.storage,
        storage_condition: sample.storage_condition || null,
        quantity: sample.quantity || 0,
        price: sample.price ? Number(sample.price) : 0,
        latitude: sample.latitude ? Number(sample.latitude) : null,
        longitude: sample.longitude ? Number(sample.longitude) : null,
        description: sample.description || null,
        inStock: sample.quantity > 0,
        user_id: sample.user_id || '',
        created_at: sample.created_at || new Date().toISOString(),
        updated_at: sample.updated_at || null,
        hash: sample.hash || null
      }));

      setAllSamples(transformedSamples);
      setVisibleSamples(transformedSamples);
      setFilteredMapSamples(transformedSamples);
      setIsLoading(false);
    };

    fetchSamples();
  }, []);

  // Callback for when map bounds change
  const handleMapBoundsChange = useCallback((visibleSampleIds: string[]) => {
    const filtered = allSamples.filter(sample => visibleSampleIds.includes(String(sample.id)));
    setVisibleSamples(filtered);
  }, [allSamples]);

  // Filter samples when search or filter criteria change
  useEffect(() => {
    let filtered = allSamples;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sample => 
        sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (selectedType !== 'All Types') {
      filtered = filtered.filter(sample => 
        sample.type.toLowerCase() === selectedType.toLowerCase()
      );
    }
    
    // Apply price range filter with safe handling of undefined prices
    filtered = filtered.filter(sample => {
      const price = sample.price ?? 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    setVisibleSamples(filtered);
  }, [searchTerm, selectedType, priceRange, allSamples]);

  // Filter map samples when active sample types change
  useEffect(() => {
    if (activeSampleTypes.length === 0) {
      setFilteredMapSamples(allSamples);
    } else {
      const filtered = allSamples.filter(sample => 
        activeSampleTypes.includes(sample.type.toLowerCase())
      );
      setFilteredMapSamples(filtered);
    }
  }, [activeSampleTypes, allSamples]);

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
                <th>Stock Status</th>
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
                    <span className={`availability-badge ${sample.inStock ? 'in-stock' : 'out-of-stock'}`}>
                      {sample.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="price">${(sample.price ?? 0).toFixed(2)}</td>
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
                
                <div className="detail-label">Stock Status:</div>
                <div className="detail-value">
                  <span className={`availability-badge ${popupInfo.sample.inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {popupInfo.sample.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                <div className="detail-label">Price:</div>
                <div className="detail-value price">${(popupInfo.sample.price ?? 0).toFixed(2)}</div>
                
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