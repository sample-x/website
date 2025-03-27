'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SamplesMap from './SamplesMap'
import SamplesTable from './SamplesTable'
import './samples.css'
import { isStaticExport } from '@/app/lib/staticData'

// Sample type definition
interface Sample {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  price: number;
  coordinates?: [number, number];
  latitude?: number;
  longitude?: number;
  collectionDate?: string;
  storageCondition?: string;
  availability: string;
  inStock?: boolean;
}

// Filter type definition
interface SampleFilters {
  search: string;
  type: string;
  minPrice: number;
  maxPrice: number;
}

export default function ClientSamples() {
  const router = useRouter()
  const [samples, setSamples] = useState<Sample[]>([])
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [isStatic, setIsStatic] = useState(true)
  const [forceDynamicMode, setForceDynamicMode] = useState(false)
  const [filters, setFilters] = useState<SampleFilters>({
    search: '',
    type: '',
    minPrice: 0,
    maxPrice: 1000
  })

  // Check if we're in static mode
  useEffect(() => {
    const staticMode = isStaticExport();
    
    // Check for localStorage override
    if (typeof window !== 'undefined') {
      try {
        const forceDynamic = localStorage.getItem('forceDynamicMode') === 'true';
        setForceDynamicMode(forceDynamic);
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
    setIsStatic(staticMode && !forceDynamicMode);
  }, [forceDynamicMode]);

  // Toggle dynamic mode
  const toggleDynamicMode = () => {
    const newValue = !forceDynamicMode;
    setForceDynamicMode(newValue);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('forceDynamicMode', newValue ? 'true' : 'false');
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
    // Force reload to apply changes
    window.location.reload();
  };

  // Mock data for samples
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockSamples: Sample[] = [
        {
          id: 'sample-001',
          name: 'Human Blood Plasma',
          type: 'tissue',
          description: 'Human blood plasma samples from healthy donors for immunological studies.',
          location: 'Seattle, WA',
          price: 120,
          coordinates: [47.6062, -122.3321],
          collectionDate: '2023-05-15',
          storageCondition: '-80°C',
          availability: 'available',
          inStock: true
        },
        {
          id: 'sample-002',
          name: 'Mouse Brain Tissue',
          type: 'tissue',
          description: 'Fixed mouse brain tissue sections for neurological research.',
          location: 'Boston, MA',
          price: 180,
          coordinates: [42.3601, -71.0589],
          collectionDate: '2023-04-20',
          storageCondition: 'Room temperature (fixed)',
          availability: 'limited',
          inStock: true
        },
        {
          id: 'sample-003',
          name: 'E. coli Culture',
          type: 'bacterial',
          description: 'Pure culture of E. coli strain K-12 for molecular biology applications.',
          location: 'Chicago, IL',
          price: 75,
          coordinates: [41.8781, -87.6298],
          collectionDate: '2023-06-01',
          storageCondition: '4°C',
          availability: 'available',
          inStock: true
        },
        {
          id: 'sample-004',
          name: 'Soil Sample from Amazon Rainforest',
          type: 'environmental',
          description: 'Rich soil sample collected from the Amazon rainforest for microbial diversity studies.',
          location: 'Manaus, Brazil',
          price: 95,
          coordinates: [-3.1190, -60.0217],
          collectionDate: '2023-03-10',
          storageCondition: 'Room temperature',
          availability: 'available',
          inStock: true
        },
        {
          id: 'sample-005',
          name: 'Human Lung Cell Line',
          type: 'cell line',
          description: 'A549 human lung epithelial cell line for respiratory research.',
          location: 'San Francisco, CA',
          price: 210,
          coordinates: [37.7749, -122.4194],
          collectionDate: '2023-05-05',
          storageCondition: 'Liquid nitrogen',
          availability: 'limited',
          inStock: true
        },
        {
          id: 'sample-006',
          name: 'Antarctic Ice Core',
          type: 'ice core',
          description: 'Ice core sample from Antarctica for climate research.',
          location: 'McMurdo Station, Antarctica',
          price: 350,
          coordinates: [-77.8419, 166.6863],
          collectionDate: '2022-12-15',
          storageCondition: '-20°C',
          availability: 'limited',
          inStock: true
        }
      ]
      
      setSamples(mockSamples)
      setFilteredSamples(mockSamples)
      setLoading(false)
    }, 1000)
  }, [])

  // Apply filters to samples
  const applyFilters = () => {
    const filtered = samples.filter(sample => {
      // Search filter
      const searchMatch = 
        sample.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        sample.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        sample.type.toLowerCase().includes(filters.search.toLowerCase()) ||
        sample.location.toLowerCase().includes(filters.search.toLowerCase())
      
      // Type filter
      const typeMatch = filters.type === '' || sample.type.toLowerCase() === filters.type.toLowerCase()
      
      // Price filter
      const priceMatch = sample.price >= filters.minPrice && sample.price <= filters.maxPrice
      
      return searchMatch && typeMatch && priceMatch
    })
    
    setFilteredSamples(filtered)
  }

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFilters(prev => ({
      ...prev,
      [name]: name === 'minPrice' || name === 'maxPrice' ? Number(value) : value
    }))
  }

  // Handle sample selection
  const handleSampleSelect = (sample: Sample) => {
    setSelectedSample(sample)
  }

  // Handle add to cart
  const handleAddToCart = (sample: Sample) => {
    // In a real app, this would add the sample to a cart
    alert(`Added ${sample.name} to cart!`)
  }

  // Apply filters when they change
  useEffect(() => {
    // Apply filters whenever samples or filter values change
    applyFilters();
  }, [samples, filters, applyFilters]);

  // Get unique sample types for filter dropdown
  const sampleTypes = Array.from(new Set(samples.map(sample => sample.type)))

  return (
    <main>
      <section className="samples-page">
        <div className="samples-hero">
          <h1>Browse Samples</h1>
          <p>
            Discover and browse scientific samples from researchers around the world.
            Find the perfect samples for your research needs.
          </p>
          
          <div className="action-buttons" style={{
            display: 'flex',
            gap: '12px',
            marginTop: '16px',
            justifyContent: 'center'
          }}>
            <Link href="/samples/upload" className="btn btn-primary" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#f97316',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
              </svg>
              Upload Samples
            </Link>
            
            <button 
              onClick={toggleDynamicMode}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: forceDynamicMode ? '#047857' : '#6b7280',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
              </svg>
              {forceDynamicMode ? 'Using Live Mode' : 'Switch to Live Mode'}
            </button>
          </div>
        </div>
        
        {/* Mode indicator */}
        {isStatic ? (
          <div className="static-mode-indicator" style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
            <span>
              Running in demo mode with static sample data. Click "Switch to Live Mode" to use real Supabase connections.
            </span>
          </div>
        ) : (
          <div className="live-mode-indicator" style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            <span>
              Running in live mode with real Supabase connection. Sample data is being loaded from your database.
            </span>
          </div>
        )}
        
        <div className="samples-container">
          <div className="samples-content">
            <div className="container">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading samples...</p>
                </div>
              ) : (
                <>
                  {/* Filter controls */}
                  <div className="filter-controls">
                    <div className="search-box">
                      <input
                        type="text"
                        name="search"
                        placeholder="Search samples..."
                        value={filters.search}
                        onChange={handleFilterChange}
                      />
                    </div>
                    
                    <div className="category-filter">
                      <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Types</option>
                        {sampleTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="price-filter">
                      <span>Price Range: </span>
                      <input
                        type="number"
                        name="minPrice"
                        placeholder="Min"
                        min="0"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                      />
                      <span> to </span>
                      <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max"
                        min="0"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                      />
                    </div>
                  </div>
                  
                  {/* Results count */}
                  <div className="results-count">
                    <p>Showing {filteredSamples.length} of {samples.length} samples</p>
                  </div>
                  
                  {/* Samples table */}
                  <div className="samples-table-container">
                    <SamplesTable
                      samples={filteredSamples}
                      onSampleSelect={handleSampleSelect}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                  
                  {/* Map */}
                  <div className="map-container">
                    <h2>Sample Locations</h2>
                    <SamplesMap
                      samples={filteredSamples}
                      onSampleSelect={handleSampleSelect}
                      onAddToCart={handleAddToCart}
                      selectedSample={selectedSample}
                    />
                  </div>
                  
                  {/* Selected sample details */}
                  {selectedSample && (
                    <div className="sample-details">
                      <h2>{selectedSample.name}</h2>
                      <div className="sample-details-grid">
                        <div className="sample-details-info">
                          <p><strong>Type:</strong> {selectedSample.type}</p>
                          <p><strong>Description:</strong> {selectedSample.description}</p>
                          <p><strong>Location:</strong> {selectedSample.location}</p>
                          <p><strong>Price:</strong> ${selectedSample.price}</p>
                          <p><strong>Collection Date:</strong> {selectedSample.collectionDate || 'N/A'}</p>
                          <p><strong>Storage Condition:</strong> {selectedSample.storageCondition || 'N/A'}</p>
                          <p><strong>Availability:</strong> {selectedSample.availability}</p>
                        </div>
                        <div className="sample-details-actions">
                          <Link href={`/samples/${selectedSample.id}`} className="btn btn-primary">
                            View Details
                          </Link>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleAddToCart(selectedSample)}
                            disabled={!selectedSample.inStock}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                      <button
                        className="btn btn-outline close-details"
                        onClick={() => setSelectedSample(null)}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
