'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { Sample as SupabaseSample } from '@/types/sample';
import dynamic from 'next/dynamic';
import './samples.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCartPlus, faFlask, faFileAlt, faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import SupabaseConnectionTest from '@/app/components/SupabaseConnectionTest';
import SamplesTable from './SamplesTable';
import { getStaticSamples, isStaticExport } from '@/app/lib/staticData';
import { toast } from 'react-toastify';

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
  const [isStatic, setIsStatic] = useState(false);
  const [selectedSample, setSelectedSample] = useState<TableSample | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if we're in static export mode (Cloudflare Pages deployment)
    const staticMode = isStaticExport();
    setIsStatic(staticMode);

    async function fetchSamples() {
      try {
        // If in static mode, use our pre-defined static data
        if (staticMode) {
          console.log('Using static sample data...');
          const staticSamples = getStaticSamples();
          setSamples(staticSamples);
          setLoading(false);
          return;
        }

        // Otherwise, fetch from Supabase
        console.log('Fetching samples from Supabase...');
        const { data, error } = await supabase
          .from('samples')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching samples:', error);
          setError(`Failed to load samples: ${error.message}`);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} samples`);
        setSamples(data || []);
      } catch (error) {
        console.error('Error in fetchSamples:', error);
        setError(`An unexpected error occurred: ${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchSamples();
  }, [supabase]);

  // Convert Supabase samples to the format expected by SamplesTable
  const tableSamples: TableSample[] = useMemo(() => samples.map(sample => ({
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
  })), [samples]);

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
    toast.success(`Added ${sample.name} to cart!`);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sample Management</h1>
      
      {/* Supabase Connection Test - only show in dynamic mode */}
      {!isStatic && <SupabaseConnectionTest />}
      
      {/* Static mode notice */}
      {isStatic && (
        <div className="bg-blue-100 text-blue-800 p-4 rounded mb-6">
          <p className="font-medium">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
            Running in static mode with demo data. Live Supabase connection is not available in this deployment.
          </p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
        <h2 className="text-2xl mb-4">Sample Locations</h2>
        
        {loading ? (
          <div className="loading-spinner">Loading samples...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <p>Check your network connection and Supabase configuration, or try the local development version.</p>
          </div>
        ) : samples.length === 0 ? (
          <div className="no-samples-message">
            <p>No samples found. Please upload some samples to get started.</p>
            <Link href="/samples/upload" className="btn btn-primary mt-4">
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              Upload Samples
            </Link>
          </div>
        ) : (
          <SamplesMapContainer samples={samples} />
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
        </div>
      )}
      
      {/* Upload Button - don't show in static mode */}
      {!isStatic && (
        <div className="upload-button-container mt-8">
          <Link href="/samples/upload" className="btn btn-primary">
            <FontAwesomeIcon icon={faUpload} className="mr-2" />
            Upload New Samples
          </Link>
        </div>
      )}

      {/* Sample Details Modal */}
      {selectedSample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
