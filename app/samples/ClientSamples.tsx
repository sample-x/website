'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SamplesMap from './SamplesMap'
import SamplesTable from './SamplesTable'
import './samples.css'
import { isStaticExport } from '@/app/lib/staticData'
import { useAuth } from '@/app/auth/AuthProvider'
import { toast } from 'react-toastify'
import { useSupabase } from '@/app/supabase-provider'
import { useCart } from '@/app/context/CartContext'
import { Database } from '@/types/supabase'
import { Sample } from '@/types/sample'

// Filter type definition
interface FilterState {
  searchQuery: string;
  selectedTypes: string[];
  minPrice: number;
  maxPrice: number;
}

type SupabaseSample = Database['public']['Tables']['samples']['Row']

export default function ClientSamples() {
  const { supabase } = useSupabase()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [dbSamples, setDBSamples] = useState<SupabaseSample[]>([])
  const [tableSamples, setTableSamples] = useState<Sample[]>([])
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStatic, setIsStatic] = useState(true)
  const [forceDynamicMode, setForceDynamicMode] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedTypes: [],
    minPrice: 0,
    maxPrice: 1000
  })

  // Check if we're in static mode
  useEffect(() => {
    const staticMode = isStaticExport();
    
    // Check for localStorage override
    let forceDynamic = false;
    if (typeof window !== 'undefined') {
      try {
        forceDynamic = localStorage.getItem('forceDynamicMode') === 'true';
        setForceDynamicMode(forceDynamic);
      } catch (e) {
        console.error('Error accessing localStorage:', e);
      }
    }
    
    // Set static mode based on environment and override
    const finalStaticMode = staticMode && !forceDynamic;
    setIsStatic(finalStaticMode);
    
    // If we're in dynamic mode, trigger sample fetch
    if (!finalStaticMode) {
      fetchSamples();
    }
  }, []);

  // Handle upload button click
  const handleUploadClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      // Redirect to login page with redirect back to upload
      router.push('/login?redirect=/samples/upload');
      toast.info('Please log in to upload samples');
    }
  };

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

  // Fetch samples from Supabase
  const fetchSamples = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('samples')
        .select('*');

      if (error) {
        console.error('Error fetching samples:', error);
        // Fall back to mock data
        const mockSamples: SupabaseSample[] = [
          {
            id: '1',
            name: "Marine Bacterial Culture",
            type: "Bacterial",
            description: "Deep sea bacterial culture isolated from hydrothermal vents",
            location: "Pacific Ocean",
            price: 299.99,
            latitude: 45.5155,
            longitude: -122.6789,
            collection_date: "2024-02-15",
            storage_condition: "frozen",
            quantity: 5,
            hash: "sample1",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: "Cell Line A549",
            type: "Cell Line",
            description: "Human lung carcinoma cell line",
            location: "Laboratory Stock",
            price: 499.99,
            latitude: 41.8781,
            longitude: -87.6298,
            collection_date: "2024-01-20",
            storage_condition: "cryogenic",
            quantity: 3,
            hash: "sample2",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setDBSamples(mockSamples);
        setTableSamples(mockSamples.map(convertToTableSample));
      } else if (data) {
        console.log('Fetched samples:', data);
        setDBSamples(data);
        setTableSamples(data.map(convertToTableSample));
      }
    } catch (error) {
      console.error('Error in fetchSamples:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for samples
  useEffect(() => {
    if (!isStatic) return; // Only load mock data in static mode
    
    // Simulate API call with mock data for now
    setLoading(true);
    setTimeout(() => {
      const mockSamples: SupabaseSample[] = [
        {
          id: '1',
          name: "Marine Bacterial Culture",
          type: "Bacterial",
          description: "Deep sea bacterial culture isolated from hydrothermal vents",
          location: "Pacific Ocean",
          price: 299.99,
          latitude: 45.5155,
          longitude: -122.6789,
          collection_date: "2024-02-15",
          storage_condition: "frozen",
          quantity: 5,
          hash: "sample1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: "Cell Line A549",
          type: "Cell Line",
          description: "Human lung carcinoma cell line",
          location: "Laboratory Stock",
          price: 499.99,
          latitude: 41.8781,
          longitude: -87.6298,
          collection_date: "2024-01-20",
          storage_condition: "cryogenic",
          quantity: 3,
          hash: "sample2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setDBSamples(mockSamples);
      setTableSamples(mockSamples.map(convertToTableSample));
      setLoading(false);
    }, 1000);
  }, [isStatic]);

  // Convert Supabase samples to table format
  const convertToDBSample = (sample: SupabaseSample): SupabaseSample => sample

  const convertToTableSample = (sample: SupabaseSample): Sample => {
    const quantity = typeof sample.quantity === 'number' ? sample.quantity : 0;
    return {
      id: sample.id,
      name: sample.name,
      type: sample.type,
      description: sample.description || '',
      location: sample.location || '',
      price: sample.price || 0,
      coordinates: sample.latitude && sample.longitude ? [sample.latitude, sample.longitude] : undefined,
      collectionDate: sample.collection_date,
      storageCondition: sample.storage_condition,
      availability: quantity > 0 ? `${quantity} available` : 'Out of Stock',
      inStock: quantity > 0,
      quantity: quantity,
      created_at: sample.created_at
    };
  };

  // Update samples state handler
  const handleSamplesUpdate = (newSamples: SupabaseSample[]) => {
    const convertedDBSamples = newSamples.map(convertToDBSample)
    setDBSamples(convertedDBSamples)
    setTableSamples(convertedDBSamples.map(convertToTableSample))
  }

  // Apply filters to samples
  const applyFilters = () => {
    const filtered = dbSamples.map(convertToTableSample).filter(sample => {
      // Search filter
      const searchMatch = 
        sample.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        sample.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        sample.type.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (sample.location?.toLowerCase() || '').includes(filters.searchQuery.toLowerCase())
      
      // Type filter
      const typeMatch = filters.selectedTypes.length === 0 || filters.selectedTypes.includes(sample.type.toLowerCase())
      
      // Price filter
      const priceMatch = (!sample.price || (sample.price >= filters.minPrice && sample.price <= filters.maxPrice))
      
      return searchMatch && typeMatch && priceMatch
    })
    
    setTableSamples(filtered)
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
    setSelectedSample(sample);
  }

  // Handle add to cart
  const handleAddToCart = (sample: Sample) => {
    if (!user) {
      router.push('/login');
      return;
    }
    const dbSample = dbSamples.find(s => s.id.toString() === sample.id);
    if (dbSample && dbSample.quantity > 0) {
      // Convert to table sample format before adding to cart
      const cartSample = convertToTableSample(dbSample);
      addToCart(cartSample);
    }
  }

  // Apply filters when they change
  useEffect(() => {
    // Apply filters whenever samples or filter values change
    applyFilters();
  }, [tableSamples, filters, applyFilters]);

  // Get unique sample types for filter dropdown
  const sampleTypes = Array.from(new Set(dbSamples.map(sample => sample.type)))

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
            <Link 
              href={user ? "/samples/upload" : "/login?redirect=/samples/upload"} 
              className="btn btn-primary" 
              onClick={handleUploadClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: '#f97316',
                color: 'white',
                borderRadius: '4px',
                fontWeight: 'bold',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
            >
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
                        name="searchQuery"
                        placeholder="Search samples..."
                        value={filters.searchQuery}
                        onChange={handleFilterChange}
                      />
                    </div>
                    
                    <div className="category-filter">
                      <select
                        name="selectedTypes"
                        value={filters.selectedTypes.join(',')}
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
                    <p>Showing {tableSamples.length} of {dbSamples.length} samples</p>
                  </div>
                  
                  {/* Samples table */}
                  <div className="samples-table-container">
                    <SamplesTable
                      samples={tableSamples}
                      onSampleSelect={handleSampleSelect}
                      onAddToCart={handleAddToCart}
                      isAuthenticated={!!user}
                    />
                  </div>
                  
                  {/* Map */}
                  <div className="map-container">
                    <h2>Sample Locations</h2>
                    <SamplesMap
                      samples={tableSamples}
                      onSampleSelect={handleSampleSelect}
                      onAddToCart={handleAddToCart}
                      selectedSample={selectedSample}
                    />
                  </div>
                  
                  {/* Selected sample details */}
                  {selectedSample && (
                    <div className="sample-details">
                      <div className="sample-details-content">
                        <h3>{selectedSample.name}</h3>
                        <p><strong>Type:</strong> {selectedSample.type}</p>
                        <p><strong>Description:</strong> {selectedSample.description || 'N/A'}</p>
                        <p><strong>Location:</strong> {selectedSample.location}</p>
                        <p><strong>Price:</strong> ${selectedSample.price}</p>
                        <p><strong>Collection Date:</strong> {selectedSample.collectionDate || 'N/A'}</p>
                        <p><strong>Storage Condition:</strong> {selectedSample.storageCondition || 'N/A'}</p>
                        <p><strong>Availability:</strong> {selectedSample.availability}</p>
                        <button onClick={() => setSelectedSample(null)}>Close</button>
                      </div>
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
