'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/supabase-provider';
import { useAuth } from '@/app/auth/AuthProvider';
import { useCart } from '@/app/context/CartContext';
import { Sample } from '@/types/sample';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrash, faShoppingCart, faDownload, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface SampleDetailClientProps {
  id: string;
}

export default function SampleDetailClient({ id }: SampleDetailClientProps) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchSampleDetails() {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('samples')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error('Error fetching sample:', fetchError);
          setError(`Failed to load sample: ${fetchError.message}`);
          throw fetchError;
        }
        
        setSample(data);
        setError(null);
      } catch (catchError) {
        console.error('Error in fetchSampleDetails:', catchError);
        if (!error) {
          setError(`An unexpected error occurred: ${(catchError as Error).message}`);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSampleDetails();
  }, [supabase, id]);

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    try {
      // Use the new RPC function
      const { data, error: deleteError } = await supabase
        .rpc('delete_sample', { sample_id: id });

      if (deleteError) {
        console.error('Error deleting sample:', deleteError);
        setError(`Failed to delete sample: ${deleteError.message}`);
        throw deleteError;
      }
      
      // Check if deletion was successful
      if (data) {
        // Navigate back to samples page
        router.push('/samples');
      } else {
        setError('Failed to delete sample: Sample may not exist or you lack permission.');
      }
    } catch (catchError) {
      console.error('Error in handleDelete:', catchError);
      if (!error) {
        setError(`An unexpected error occurred: ${(catchError as Error).message}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading sample details...</div>;
  }

  if (error) {
    return (
      <div className="error-message bg-red-50 p-6 rounded-lg">
        <h2 className="text-red-800 text-xl mb-4">Error</h2>
        <p className="text-red-600">{error}</p>
        <Link href="/samples" className="btn btn-primary mt-4">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Samples
        </Link>
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="not-found-message bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-yellow-800 text-xl mb-4">Sample Not Found</h2>
        <p className="text-yellow-600">The requested sample could not be found. It may have been removed or you may have followed an invalid link.</p>
        <Link href="/samples" className="btn btn-primary mt-4">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Samples
        </Link>
      </div>
    );
  }

  return (
    <div className="sample-detail-client">
      <div className="mb-8 flex items-center justify-between">
        <Link 
          href="/samples" 
          className="bg-white rounded-md py-2 px-4 text-[#003949] hover:bg-gray-100 transition-colors flex items-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Samples
        </Link>
        
        <div className="flex gap-2">
          <button 
            onClick={() => router.push(`/checkout/${id}`)}
            className="bg-[#f59e0b] rounded-md py-2 px-4 text-white hover:bg-[#d97706] transition-colors flex items-center"
          >
            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
            Add to Cart
          </button>
          
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className={`rounded-md py-2 px-4 text-white flex items-center transition-colors ${
              deleteConfirm 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {deleting ? (
              'Deleting...'
            ) : deleteConfirm ? (
              <>
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                Confirm Delete
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete Sample
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#003949] text-white px-6 py-4">
          <h1 className="text-2xl font-bold">{sample.name}</h1>
          <div className="flex mt-2">
            <span className="text-sm bg-[#f59e0b]/20 text-[#f59e0b] px-3 py-1 rounded-full">
              {sample.type}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#003949]">Sample Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{sample.location}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Collection Date</p>
                    <p className="font-medium">{sample.collectionDate}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Storage Condition</p>
                    <p className="font-medium">{sample.storageCondition}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">${sample.price}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Quantity Available</p>
                    <p className="font-medium">{sample.quantity}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="font-medium text-sm truncate">{sample.id}</p>
                  </div>
                </div>
                
                {sample.description && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p>{sample.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#003949]">Location Information</h2>
              
              {sample.coordinates && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Location</h3>
                  <div className="bg-gray-100 h-[300px] rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="font-medium">Location Information</p>
                      <p className="text-sm text-gray-500">Latitude: {sample.coordinates[0]}</p>
                      <p className="text-sm text-gray-500">Longitude: {sample.coordinates[1]}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4 text-[#003949]">Additional Information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-gray-100 p-4 rounded-lg text-center hover:bg-gray-200 transition-colors">
                    <FontAwesomeIcon icon={faDownload} className="text-xl mb-2" />
                    <p className="font-medium">Sample Datasheet</p>
                  </button>
                  
                  <button className="bg-gray-100 p-4 rounded-lg text-center hover:bg-gray-200 transition-colors">
                    <FontAwesomeIcon icon={faDownload} className="text-xl mb-2" />
                    <p className="font-medium">Safety Information</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 