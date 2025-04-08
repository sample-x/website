'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useSupabase } from '@/app/supabase-provider';
import { Sample } from '@/types/sample';
import SampleViewEditClient from './[id]/SampleViewEditClient';
import EditSampleClient from './edit/[id]/EditSampleClient';

export default function SamplesPage() {
  const params = useParams();
  const router = useRouter();
  const { supabase } = useSupabase();
  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get pathname for client-side navigation
  const pathname = usePathname();
  
  // Get sample ID from params and determine edit mode
  useEffect(() => {
    if (!params) return;
    
    // Extract the ID from params
    const id = params.id as string;
    
    // Check if we're in edit mode using the pathname
    const isEdit = pathname?.includes('/samples/edit/') || false;
    
    if (isEdit) {
      setIsEditMode(true);
    }
    
    // Fetch sample if we have an ID
    if (id) {
      fetchSample(id);
    }
  }, [params, pathname]);
  
  const fetchSample = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('samples')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setSample(data);
      } else {
        setError('Sample not found');
      }
    } catch (err) {
      console.error('Error fetching sample:', err);
      setError('Failed to load sample');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-orange-500" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">Loading sample...</p>
        </div>
      </div>
    );
  }
  
  if (error || !sample) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-lg w-full">
          <h2 className="text-yellow-800 text-xl mb-4 font-bold">Sample Not Found</h2>
          <p className="text-yellow-600 mb-6">{error || 'The requested sample could not be found. It may have been removed or you may have followed an invalid link.'}</p>
          <button
            onClick={() => router.push('/samples')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600"
          >
            Back to Samples
          </button>
        </div>
      </div>
    );
  }
  
  // Render the appropriate component based on mode
  return (
    <div>
      {isEditMode ? (
        <EditSampleClient id={sample.id.toString()} />
      ) : (
        <SampleViewEditClient id={sample.id.toString()} />
      )}
    </div>
  );
} 