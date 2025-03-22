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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
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
        console.log('Fetching samples data...');
        const response = await fetch('/api/samples');
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch samples: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Samples data received:', data);
        
        // Ensure the data is in the expected format
        if (Array.isArray(data)) {
          // Add default values for potentially missing fields expected by SampleList
          const processedData = data.map((sample: any) => ({
            ...sample,
            price: sample.price || 0,
            quantity: sample.quantity || 1,
            unit: sample.unit || 'unit'
          }));
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
            <pre>{JSON.stringify({ timestamp: new Date().toISOString() }, null, 2)}</pre>
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