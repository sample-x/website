'use client';

import { useEffect, useState } from 'react';
import SampleList from './SampleList';
import SamplesMap from './SamplesMap';
import { useSearchParams } from 'next/navigation';
import { Sample } from './types';

export default function ClientSamples() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('ClientSamples component mounted');
    
    // Get search parameters from URL if present
    const urlSearchTerm = searchParams?.get('search') || '';
    const urlFilterType = searchParams?.get('type') || '';
    const urlFilterAvailability = searchParams?.get('availability') || '';
    
    setSearchTerm(urlSearchTerm);
    setFilterType(urlFilterType);
    setFilterAvailability(urlFilterAvailability);

    // Fetch samples data
    const fetchSamples = async () => {
      setLoading(true);
      try {
        console.log('Fetching samples data from API...');
        const response = await fetch('/api/samples');
        
        const responseText = await response.text();
        console.log('Raw API response:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
          setApiResponse(data);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        console.log('Samples data received:', data);
        
        // Ensure the data is in the expected format
        if (Array.isArray(data)) {
          // Process the data to match our type definition
          const processedData = data.map((sample: any) => {
            console.log('Processing sample:', sample);
            
            // Convert lat/lng to coordinates tuple if they exist
            let coordinates: [number, number] | undefined = undefined;
            
            if (sample.latitude && sample.longitude) {
              const lat = parseFloat(sample.latitude);
              const lng = parseFloat(sample.longitude);
              if (!isNaN(lat) && !isNaN(lng)) {
                coordinates = [lat, lng];
              }
            } else if (Array.isArray(sample.coordinates) && sample.coordinates.length >= 2) {
              // If coordinates already exist as an array, ensure it's a tuple
              coordinates = [sample.coordinates[0], sample.coordinates[1]];
            }
            
            return {
              ...sample,
              coordinates,
              price: sample.price ?? 0,
              quantity: sample.quantity ?? 1,
              unit: sample.unit ?? 'unit'
            } as Sample;
          });
          
          console.log('Processed data:', processedData);
          setSamples(processedData);
        } else {
          setSamples([]);
          setError('Received invalid data format from server');
        }
      } catch (err) {
        console.error('Error fetching samples:', err);
        setError(err instanceof Error ? err.message : 'Unknown error fetching samples');
        setSamples([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, [searchParams]);

  // Filter samples based on search term and filters
  const filteredSamples = samples.filter(sample => {
    const matchesSearch = searchTerm === '' || 
      Object.values(sample).some(value => 
        value && typeof value === 'string' && 
        value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
    const matchesType = filterType === '' || sample.type.toLowerCase() === filterType.toLowerCase();
    const matchesAvailability = filterAvailability === '' || 
      sample.availability.toLowerCase() === filterAvailability.toLowerCase();
      
    return matchesSearch && matchesType && matchesAvailability;
  });

  // Get unique types for filter
  const uniqueTypes = [...new Set(samples.map(sample => sample.type))];
  const uniqueAvailabilities = [...new Set(samples.map(sample => sample.availability))];

  return (
    <div className="samples-container">
      <h1>Sample Exchange</h1>
      <p>Browse our collection of high-quality samples</p>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading samples...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <h2>Error Loading Samples</h2>
          <p>{error}</p>
          <p>Please try again later or contact support if the problem persists.</p>
          <div className="debug-info">
            <h3>Debugging Information</h3>
            <pre>{JSON.stringify({ 
              timestamp: new Date().toISOString(),
              apiResponse
            }, null, 2)}</pre>
          </div>
        </div>
      ) : samples.length === 0 ? (
        <div className="no-samples">
          <h2>No Samples Found</h2>
          <p>We couldn't find any samples matching your criteria.</p>
          <div className="debug-info">
            <h3>API Response</h3>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <div>
          <div className="filters-container">
            <input
              type="text"
              placeholder="Search samples..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select 
              value={filterAvailability} 
              onChange={e => setFilterAvailability(e.target.value)}
              className="filter-select"
            >
              <option value="">All Availability</option>
              {uniqueAvailabilities.map(availability => (
                <option key={availability} value={availability}>{availability}</option>
              ))}
            </select>
          </div>
          
          <div className="results-container">
            <p>{filteredSamples.length} samples found</p>
            
            <div className="samples-display">
              <SampleList samples={filteredSamples} />
              
              <div className="map-container">
                {filteredSamples.length > 0 && (
                  <SamplesMap samples={filteredSamples} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 