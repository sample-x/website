'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SamplesMap from './SamplesMap'
import './samples.css'

// Define some fallback sample data in case the API fails
const fallbackSamples = [
  {
    id: 'sample-1',
    name: 'Lake Michigan Water Sample',
    description: 'Water sample collected from Lake Michigan shoreline for environmental monitoring.',
    type: 'Water Sample',
    price: 149.99,
    quantity: 500,
    unit: 'mL',
    provider: 'Great Lakes Research',
    host: 'Environmental',
    locationName: 'Michigan, USA',
    location: { lat: 43.0, lng: -87.5 }
  },
  {
    id: 'sample-2',
    name: 'Amazon Rainforest Soil',
    description: 'Rich soil sample from the Amazon rainforest containing diverse microorganisms.',
    type: 'Soil',
    price: 199.99,
    quantity: 250,
    unit: 'g',
    provider: 'Tropical Biome Research',
    host: 'Environmental',
    locationName: 'Amazon Basin, Brazil',
    location: { lat: -3.4653, lng: -62.2159 }
  },
  {
    id: 'sample-ind-1',
    name: 'Clostridium acetobutylicum ATCC 824',
    description: 'Industrial strain used for acetone-butanol-ethanol fermentation. This anaerobic bacterium is widely used in industrial biotechnology for solvent production.',
    type: 'Industrial Bacteria',
    price: 299.99,
    quantity: 1,
    unit: 'vial',
    provider: 'BioIndustrial Solutions',
    host: 'N/A',
    locationName: 'Chicago, IL',
    location: { lat: 41.8781, lng: -87.6298 }
  },
  {
    id: 'sample-ind-2',
    name: 'Streptomyces coelicolor A3(2)',
    description: 'Model industrial actinomycete strain used for antibiotic production research. This soil bacterium produces several antibiotics and has a complex developmental life cycle.',
    type: 'Industrial Bacteria',
    price: 349.99,
    quantity: 1,
    unit: 'culture',
    provider: 'Microbial Resources Inc.',
    host: 'N/A',
    locationName: 'Boston, MA',
    location: { lat: 42.3601, lng: -71.0589 }
  },
  {
    id: 'sample-cell-1',
    name: 'NIH/3T3 Mouse Fibroblasts',
    description: 'Standard fibroblast cell line derived from mouse embryo tissue. These cells are widely used in cell biology research and are known for their high transfection efficiency.',
    type: 'Cell Line',
    price: 425.00,
    quantity: 1,
    unit: 'vial (1×10^6 cells)',
    provider: 'CellBiotech',
    host: 'Mus musculus',
    locationName: 'San Diego, CA',
    location: { lat: 32.7157, lng: -117.1611 }
  },
  {
    id: 'sample-cell-2',
    name: 'RK13 Rabbit Kidney Epithelial Cells',
    description: 'Epithelial cell line derived from rabbit kidney. These cells are commonly used for virus propagation and vaccine production studies.',
    type: 'Cell Line',
    price: 399.99,
    quantity: 1,
    unit: 'vial (5×10^6 cells)',
    provider: 'EukaryoTech',
    host: 'Oryctolagus cuniculus',
    locationName: 'Cambridge, MA',
    location: { lat: 42.3736, lng: -71.1097 }
  },
  {
    id: 'sample-env-1',
    name: 'Deep Sea Sediment Sample',
    description: 'Sediment collected from the Mariana Trench at 8,000m depth. Contains unique extremophile microorganisms adapted to high pressure environments.',
    type: 'Environmental Sample',
    price: 899.99,
    quantity: 50,
    unit: 'g',
    provider: 'OceanExplore',
    host: 'Environmental',
    locationName: 'Mariana Trench, Pacific Ocean',
    location: { lat: 11.3493, lng: 142.1996 }
  },
  {
    id: 'sample-env-2',
    name: 'Yellowstone Hot Spring Water',
    description: 'Water sample from Grand Prismatic Spring containing thermophilic bacteria and archaea. Temperature at collection was 87°C with pH 8.3.',
    type: 'Water Sample',
    price: 499.99,
    quantity: 100,
    unit: 'mL',
    provider: 'ThermoSamples',
    host: 'Environmental',
    locationName: 'Yellowstone National Park, WY',
    location: { lat: 44.5251, lng: -110.8390 }
  }
];

export default function SamplesPage() {
  const [samples, setSamples] = useState([])
  const [filteredSamples, setFilteredSamples] = useState([])
  const [filter, setFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const router = useRouter()

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [categoryParam])

  // Function to get host information
  const getHostInfo = (sample) => {
    if (sample.host && sample.host !== 'Unknown') return sample.host;
    
    // Default to "Environmental" for certain types
    if (sample.type.toLowerCase().includes('water') || 
        sample.type.toLowerCase().includes('soil') ||
        sample.type.toLowerCase().includes('environmental') ||
        sample.type.toLowerCase().includes('ice') ||
        sample.type.toLowerCase().includes('air')) {
      return 'Environmental';
    }
    
    return 'Not specified';
  };

  // Function to get location name
  const getLocationName = (sample) => {
    if (sample.locationName && sample.locationName !== 'Unknown') return sample.locationName;
    
    // Map location names based on sample names
    if (sample.name.includes('Michigan')) return 'Michigan, USA';
    if (sample.name.includes('Amazon')) return 'Amazon Basin, Brazil';
    if (sample.name.includes('Los Angeles')) return 'Los Angeles, USA';
    if (sample.name.includes('Arctic')) return 'Arctic Circle';
    if (sample.name.includes('Sahara')) return 'Sahara Desert, North Africa';
    if (sample.name.includes('Barrier Reef')) return 'Great Barrier Reef, Australia';
    if (sample.name.includes('Tokyo')) return 'Tokyo, Japan';
    if (sample.name.includes('Mississippi')) return 'Mississippi River, USA';
    if (sample.name.includes('Fuji')) return 'Mount Fuji, Japan';
    if (sample.name.includes('Antarctic')) return 'Antarctica';
    
    return sample.location ? 'Location available' : 'Unknown';
  };

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        // Fetch from the backend API
        const response = await fetch('http://localhost:5000/api/samples');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the data
        const processedData = data.map(sample => ({
          ...sample,
          host: sample.host || getHostInfo(sample),
          locationName: sample.locationName || getLocationName(sample)
        }));
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(processedData.map(sample => sample.type.toLowerCase()))
        );
        
        setSamples(processedData);
        setFilteredSamples(processedData);
        setCategories(uniqueCategories);
        setIsLoading(false);
        setError(''); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching samples:', error);
        
        // Use our fallback samples without showing an error message
        const enhancedFallbackSamples = fallbackSamples.map(sample => ({
          ...sample,
          host: sample.host || getHostInfo(sample),
          locationName: sample.locationName || getLocationName(sample)
        }));
        
        // Extract unique categories from fallback data
        const fallbackCategories = Array.from(
          new Set(enhancedFallbackSamples.map(sample => sample.type.toLowerCase()))
        );
        
        setSamples(enhancedFallbackSamples);
        setFilteredSamples(enhancedFallbackSamples);
        setCategories(fallbackCategories);
        setIsLoading(false);
        
        // Only show the error message if we're in development mode
        if (process.env.NODE_ENV === 'development') {
          setError('Using sample data for demonstration purposes.');
        } else {
          setError('');
        }
      }
    };
    
    fetchSamples();
  }, []);

  useEffect(() => {
    let result = samples;
    
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(sample => 
        sample.name.toLowerCase().includes(lowerFilter) ||
        sample.description.toLowerCase().includes(lowerFilter) ||
        sample.type.toLowerCase().includes(lowerFilter) ||
        (sample.provider && sample.provider.toLowerCase().includes(lowerFilter))
      );
    }
    
    if (selectedCategory) {
      result = result.filter(sample => 
        sample.type.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    setFilteredSamples(result);
  }, [filter, selectedCategory, samples]);

  const handlePurchase = (sampleId) => {
    router.push(`/checkout/${sampleId}`)
  }

  return (
    <main>
      <section className="samples-section">
        <div className="container">
          <h1>Sample Exchange</h1>
          
          {isLoading ? (
            <div className="loading">Loading samples...</div>
          ) : (
            <>
              <div className="filters">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search samples..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
                
                <div className="category-filter">
                  <label htmlFor="category">Filter by Type:</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="samples-grid">
                <div className="samples-list">
                  <h2>Available Samples ({filteredSamples.length})</h2>
                  
                  {filteredSamples.length === 0 ? (
                    <div className="no-results">
                      <p>No samples found matching your criteria.</p>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setFilter('');
                          setSelectedCategory('');
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="samples-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Host</th>
                            <th>Location</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSamples.map(sample => (
                            <tr key={sample.id}>
                              <td>{sample.name}</td>
                              <td>
                                <span className={`category-badge ${sample.type.toLowerCase().replace(/\s+/g, '-')}`}>
                                  {sample.type}
                                </span>
                              </td>
                              <td>{sample.host || getHostInfo(sample)}</td>
                              <td>{sample.locationName || getLocationName(sample)}</td>
                              <td>
                                <button 
                                  className="btn-purchase"
                                  onClick={() => handlePurchase(sample.id)}
                                >
                                  Purchase
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                <div className="map-container">
                  {filteredSamples.length > 0 && (
                    <SamplesMap samples={filteredSamples} />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
} 