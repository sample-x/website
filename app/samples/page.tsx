'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { Sample as SupabaseSample } from '@/types/sample';
import dynamic from 'next/dynamic';
import './samples.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCartPlus, faFlask, faFileAlt, faUpload } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import SupabaseConnectionTest from '@/app/components/SupabaseConnectionTest';
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

  useEffect(() => {
    async function fetchSamples() {
      try {
        console.log('Fetching samples...');
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
  const tableSamples: TableSample[] = samples.map(sample => ({
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

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sample Management</h1>
      
      {/* Supabase Connection Test */}
      <SupabaseConnectionTest />
      
      <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
        <h2 className="text-2xl mb-4">Sample Locations</h2>
        
        {loading ? (
          <div className="loading-spinner">Loading samples...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <p>Please check your network connection and Supabase configuration.</p>
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
        <div className="bg-white rounded-lg shadow-lg p-4">
          <SamplesTable 
            samples={tableSamples}
            onSampleSelect={(sample) => console.log('Sample selected:', sample)}
            onAddToCart={(sample) => console.log('Adding to cart:', sample)}
          />
        </div>
      )}
      
      {/* Upload Button */}
      <div className="upload-button-container mt-8">
        <Link href="/samples/upload" className="btn btn-primary">
          <FontAwesomeIcon icon={faUpload} className="mr-2" />
          Upload New Samples
        </Link>
      </div>
    </main>
  );
}
