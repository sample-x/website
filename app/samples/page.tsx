'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { Sample as SupabaseSample } from '@/types/sample';
import dynamic from 'next/dynamic';
import './samples.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCartPlus, faFlask, faFileAlt, faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import SamplesTable from './SamplesTable';

// Define an interface that matches what SamplesTable expects
interface TableSample {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  price: number;
  coordinates?: [number, number];
  collectionDate?: string;
  storageCondition?: string;
  availability: string;
  inStock?: boolean;
}

const SamplesMapContainer = dynamic(
  () => import('@/components/SamplesMapContainer'),
  { ssr: false }
);

export default function SamplesPage() {
  const { supabase } = useSupabase();
  const [samples, setSamples] = useState<SupabaseSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<TableSample | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapFilteredSamples, setMapFilteredSamples] = useState<SupabaseSample[]>([]);

  useEffect(() => {
    async function fetchSamples() {
      setLoading(true);
      try {
        console.log('Fetching samples from Supabase (Client-side)...');
        const { data, error: fetchError } = await supabase
          .from('samples')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error fetching samples:', fetchError);
          setError(`Failed to load samples: ${fetchError.message}`);
          throw fetchError;
        }
        
        console.log(`Fetched ${data?.length || 0} samples`);
        setSamples(data || []);
        setError(null);
      } catch (catchError) {
        console.error('Error in fetchSamples:', catchError);
        if (!error) {
          setError(`An unexpected error occurred: ${(catchError as Error).message}`);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSamples();
  }, [supabase]);

  // Convert Supabase samples to the format expected by SamplesTable
  const tableSamples: TableSample[] = useMemo(() => {
    // Use mapFilteredSamples if they exist, otherwise use all samples
    const sourceArray = mapFilteredSamples.length > 0 ? mapFilteredSamples : samples;
    
    return sourceArray.map(sample => ({
      id: sample.id.toString(),
      name: sample.name,
      type: sample.type,
      description: sample.description || '',
      location: sample.location,
      price: sample.price,
      coordinates: sample.latitude && sample.longitude ? [sample.latitude, sample.longitude] : undefined,
      collectionDate: sample.collection_date,
      storageCondition: sample.storage_condition,
      availability: sample.quantity > 0 ? 'Available' : 'Out of Stock',
      inStock: sample.quantity > 0
    }));
  }, [samples, mapFilteredSamples]);

  // Filter samples based on search term
  const filteredTableSamples = useMemo(() => {
    if (!searchTerm) {
      return tableSamples;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return tableSamples.filter(sample => 
      sample.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      sample.type.toLowerCase().includes(lowerCaseSearchTerm) ||
      sample.location.toLowerCase().includes(lowerCaseSearchTerm) ||
      (sample.description && sample.description.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [tableSamples, searchTerm]);

  const handleSampleSelect = (sample: TableSample) => {
    setSelectedSample(sample);
  };

  const handleAddToCart = (sample: TableSample) => {
    // Implementation of handleAddToCart
  };

  // Handler for map filter changes
  const handleMapFilterChange = (filteredSamples: SupabaseSample[]) => {
    setMapFilteredSamples(filteredSamples);
    // Clear search term when filtering by map
    setSearchTerm('');
  };

  // Helper function to calculate sample type distribution
  const calculateSampleTypeDistribution = () => {
    const typeCount: Record<string, number> = {};
    let total = 0;
    
    // Count occurrences of each type
    samples.forEach(sample => {
      const type = sample.type.toLowerCase();
      typeCount[type] = (typeCount[type] || 0) + 1;
      total++;
    });
    
    // Convert to percentage and format
    const result = Object.entries(typeCount)
      .map(([type, count]) => ({
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5); // Top 5 types
    
    // If there are other types, group them
    const sumPercentage = result.reduce((sum, item) => sum + item.percentage, 0);
    if (sumPercentage < 100) {
      result.push({
        type: 'other',
        label: 'Other',
        count: total - result.reduce((sum, item) => sum + item.count, 0),
        percentage: 100 - sumPercentage
      });
    }
    
    return result;
  };

  return (
    <main className="container mx-auto px-4 py-8">
      
      <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
        <h2 className="text-2xl mb-4">Samples Overview</h2>
        
        {loading ? (
          <div className="loading-spinner">Loading map and samples...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : samples.length === 0 && !loading ? (
          <div className="no-samples-message">
            <p>No samples found.</p>
          </div>
        ) : (
          <div className="map-wrapper relative h-[500px] overflow-hidden">
            <SamplesMapContainer 
              samples={samples} 
              onFilterChange={handleMapFilterChange} 
            />
          </div>
        )}
      </div>

      {/* Sample Table Section */}
      {!loading && !error && samples.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-4 mt-8">
          <div className="mb-4">
            <input 
              type="text"
              placeholder="Search samples (name, type, location...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <SamplesTable 
            samples={filteredTableSamples}
            onSampleSelect={handleSampleSelect}
            onAddToCart={handleAddToCart}
          />
          
          <div className="upload-button-container mt-4 flex justify-end">
            <Link href="/samples/upload" className="btn btn-primary">
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              Upload New Samples
            </Link>
          </div>
        </div>
      )}
      
      {/* Overview Section */}
      {!loading && !error && samples.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Platform Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Samples</p>
              <p className="text-3xl font-bold">{samples.length}</p>
              <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Active Users</p>
              <p className="text-3xl font-bold">347</p>
              <p className="text-xs text-gray-500 mt-1">+8% from last month</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Exchanges</p>
              <p className="text-3xl font-bold">89</p>
              <p className="text-xs text-gray-500 mt-1">+15% from last month</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">Sample Distribution</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <p className="text-gray-600 mb-4">Distribution of samples by type:</p>
            
            <div className="space-y-3">
              {calculateSampleTypeDistribution().map(item => (
                <div key={item.type}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-medium">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${item.percentage}%`, 
                        backgroundColor: getSampleColor(item.type) 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">Platform Updates</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-[#fead24] pl-4 py-2">
              <p className="font-semibold">New Filtering Options</p>
              <p className="text-sm text-gray-600">Added advanced filtering for samples based on collection date and storage conditions.</p>
              <p className="text-xs text-gray-400 mt-1">June 15, 2023</p>
            </div>
            
            <div className="border-l-4 border-[#fead24] pl-4 py-2">
              <p className="font-semibold">Improved Map Visualization</p>
              <p className="text-sm text-gray-600">Enhanced the map with better visual indicators and filtering capabilities.</p>
              <p className="text-xs text-gray-400 mt-1">May 28, 2023</p>
            </div>
            
            <div className="border-l-4 border-[#fead24] pl-4 py-2">
              <p className="font-semibold">API Access</p>
              <p className="text-sm text-gray-600">Released the beta version of our API for developers and research partners.</p>
              <p className="text-xs text-gray-400 mt-1">April 10, 2023</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Sample Details Modal */}
      {selectedSample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative">
            <button
              onClick={() => setSelectedSample(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <h2 className="text-2xl font-bold mb-4">{selectedSample.name}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-600">Type</p>
                <p className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: getSampleColor(selectedSample.type) }}
                  ></span>
                  {selectedSample.type}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-600">Location</p>
                <p>{selectedSample.location}</p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-600">Collection Date</p>
                <p>{selectedSample.collectionDate || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-600">Storage Condition</p>
                <p>{selectedSample.storageCondition || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-600">Price</p>
                <p>${selectedSample.price.toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-600">Availability</p>
                <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                  selectedSample.inStock
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedSample.availability}
                </span>
              </div>
            </div>
            
            {selectedSample.description && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-600 mb-2">Description</p>
                <p className="text-gray-700">{selectedSample.description}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setSelectedSample(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAddToCart(selectedSample);
                  setSelectedSample(null);
                }}
                disabled={!selectedSample.inStock}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedSample.inStock
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                }`}
              >
                <FontAwesomeIcon icon={faCartPlus} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Helper function to get color for sample type
const getSampleColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    'tissue': '#ef4444',
    'bacterial': '#10b981',
    'cell line': '#8b5cf6',
    'environmental': '#3b82f6',
    'soil': '#92400e',
    'botanical': '#65a30d',
    'viral': '#db2777',
    'dna': '#7c3aed',
    'water sample': '#0ea5e9',
    'industrial strain': '#64748b'
  };
  return colors[type.toLowerCase()] || '#888888';
};
