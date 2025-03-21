'use client';

import { useEffect, useState, Suspense } from 'react';
import SampleList from './SampleList';
import SamplesMap from './SamplesMap';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

// Sample type definition
interface Sample {
  id: number;
  name: string;
  type: string;
  location: string;
  availability?: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  provider?: string;
  host?: string;
  locationName?: string;
  coordinates?: [number, number];
}

// Define API response type - for data before processing
interface ApiSample {
  id: number;
  name: string;
  type: string;
  location: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  availability?: string;
  provider?: string;
  host?: string;
  locationName?: string;
}

export default function ClientSamples() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
  const [filter, setFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Create a separate component for handling search params
  function CategoryHandler() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams?.get('category');
    
    useEffect(() => {
      if (categoryParam) {
        setSelectedCategory(categoryParam);
      }
    }, [categoryParam]);
    
    return null;
  }

  // Function to get host information
  const getHostInfo = (sample: Sample) => {
    if (sample.host && sample.host !== 'Unknown') return sample.host;
    
    // Default to "Environmental" for certain types
    if (['water', 'soil', 'air'].includes(sample.type.toLowerCase())) {
      return "Environmental";
    }
    
    return "Not specified";
  };

  // Function to get location name
  const getLocationName = (sample: Sample) => {
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
        // Fetch from your API endpoint
        const response = await fetch('/api/samples');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json() as ApiSample[];
        
        // Process the data
        const processedData = data.map((sample: ApiSample) => ({
          ...sample,
          host: sample.host || getHostInfo(sample as Sample),
          locationName: sample.locationName || getLocationName(sample as Sample)
        })) as Sample[];
        
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
        
        // Use fallback data
        // ... your fallback code here
        
        setIsLoading(false);
      }
    };
    
    fetchSamples();
  }, []);

  // Filter samples based on search input and category
  useEffect(() => {
    let result = samples;
    
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter((sample: Sample) => 
        sample.name.toLowerCase().includes(lowerFilter) ||
        sample.description.toLowerCase().includes(lowerFilter) ||
        sample.type.toLowerCase().includes(lowerFilter) ||
        (sample.provider && sample.provider.toLowerCase().includes(lowerFilter))
      );
    }
    
    if (selectedCategory) {
      result = result.filter((sample: Sample) => 
        sample.type.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    setFilteredSamples(result);
  }, [filter, selectedCategory, samples]);

  const handlePurchase = (sampleId: number | string) => {
    router.push(`/checkout/${sampleId}`);
  };

  return (
    <div className="samples-container">
      <Suspense fallback={<div>Loading categories...</div>}>
        <CategoryHandler />
      </Suspense>
      
      {isLoading ? (
        <div className="loading">Loading samples...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="samples-content">
          <div className="filters">
            <input
              type="text"
              placeholder="Search samples..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="search-input"
            />
            
            <div className="category-filters">
              <button 
                className={selectedCategory === '' ? 'active' : ''}
                onClick={() => setSelectedCategory('')}
              >
                All
              </button>
              
              {categories.map(category => (
                <button
                  key={category}
                  className={selectedCategory === category ? 'active' : ''}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="view-options">
            <button className="view-btn">List View</button>
            <button className="view-btn">Map View</button>
          </div>
          
          <div className="samples-display">
            <div className="list-view">
              {filteredSamples.length === 0 ? (
                <div className="no-results">No samples found matching your criteria.</div>
              ) : (
                <div className="table-container">
                  <SampleList samples={filteredSamples} />
                </div>
              )}
            </div>
            
            <div className="map-container">
              {filteredSamples.length > 0 && (
                <SamplesMap samples={filteredSamples} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 