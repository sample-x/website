'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SamplesMap from './SamplesMap'
import SamplesTable from './SamplesTable'
import './samples.css'

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
  const [filters, setFilters] = useState<SampleFilters>({
    search: '',
    type: '',
    minPrice: 0,
    maxPrice: 1000
  })

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
    applyFilters()
  }, [filters, samples])

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
        </div>
        
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
      </section>
    </main>
  )
}
