'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { useAuth } from '@/app/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Sample } from '@/app/types/sample';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faTrash, faShoppingCart, faDownload, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface SampleViewEditClientProps {
  id: string;
}

export default function SampleViewEditClient({ id }: SampleViewEditClientProps) {
  const { supabase } = useSupabase();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

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
        
        // Check if the current user is the owner of the sample
        if (user && data.user_id === user.id) {
          setIsOwner(true);
        }
        
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
  }, [supabase, id, user]);

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    try {
      // Delete the sample
      const { error: deleteError } = await supabase
        .from('samples')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting sample:', deleteError);
        setError(`Failed to delete sample: ${deleteError.message}`);
        throw deleteError;
      }
      
      toast.success('Sample deleted successfully');
      // Navigate back to my samples page
      router.push('/samples/my-samples');
    } catch (catchError) {
      console.error('Error in handleDelete:', catchError);
      if (!error) {
        setError(`An unexpected error occurred: ${(catchError as Error).message}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = () => {
    router.push(`/samples/edit/${id}`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-orange-500" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">Loading sample details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 p-6 rounded-lg max-w-lg w-full">
          <h2 className="text-red-800 text-xl mb-4 font-bold">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            href="/samples"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Samples
          </Link>
        </div>
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-lg w-full">
          <h2 className="text-yellow-800 text-xl mb-4 font-bold">Sample Not Found</h2>
          <p className="text-yellow-600 mb-6">The requested sample could not be found. It may have been removed or you may have followed an invalid link.</p>
          <Link
            href="/samples"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Samples
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link 
              href={isOwner ? "/samples/my-samples" : "/samples"} 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to {isOwner ? "My Samples" : "Samples"}
            </Link>
            
            {isOwner && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleEditClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Edit Sample
                </button>
                
                <button
                  onClick={handleDelete}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    deleteConfirm ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                  }`}
                  disabled={deleting}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  {deleting ? 'Deleting...' : deleteConfirm ? 'Confirm Delete' : 'Delete'}
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
              <h1 className="text-2xl font-bold">{sample.name}</h1>
              <div className="flex mt-2">
                <span className="text-sm bg-white/20 text-white px-3 py-1 rounded-full">
                  {sample.type}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Sample Details</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{sample.location}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Collection Date</p>
                        <p className="font-medium">{sample.collection_date}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Storage Condition</p>
                        <p className="font-medium">{sample.storage_condition}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium">${sample.price.toFixed(2)}</p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium">
                          {sample.status === 'public' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Public (Listed in Marketplace)
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Private (Only visible to you)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {/* Add ownership section */}
                    {(sample.institution_name || sample.institution_contact_name || sample.institution_contact_email) && (
                      <div className="mt-6">
                        <h3 className="text-md font-semibold mb-3 text-gray-800">Ownership Information</h3>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          {sample.institution_name && (
                            <div className="mb-2">
                              <span className="font-semibold">Institution:</span> {sample.institution_name}
                            </div>
                          )}
                          {isOwner && sample.institution_contact_name && (
                            <div className="mb-2">
                              <span className="font-semibold">Contact Person:</span> {sample.institution_contact_name}
                            </div>
                          )}
                          {isOwner && sample.institution_contact_email && (
                            <div>
                              <span className="font-semibold">Contact Email:</span> {sample.institution_contact_email}
                            </div>
                          )}
                          {!isOwner && (
                            <div className="mt-2 text-sm text-blue-600">
                              <p>Contact information is only visible to the sample owner.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Location Information</h2>
                  
                  {sample.latitude !== undefined && sample.longitude !== undefined && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Location</h3>
                      <div className="bg-gray-100 h-[300px] rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <p className="font-medium">Location Information</p>
                          <p className="text-sm text-gray-500">Latitude: {sample.latitude}</p>
                          <p className="text-sm text-gray-500">Longitude: {sample.longitude}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isOwner && (
                    <div className="mt-6">
                      <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600">
                        <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 