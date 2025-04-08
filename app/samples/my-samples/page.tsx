'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthProvider';
import { useSupabase } from '@/app/supabase-provider';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Sample } from '@/types/sample';

export default function MySamplesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { supabase } = useSupabase();
  const router = useRouter();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sampleToDelete, setSampleToDelete] = useState<Sample | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch user's samples
  useEffect(() => {
    async function fetchSamples() {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('samples')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setSamples(data || []);
      } catch (err) {
        console.error('Error fetching samples:', err);
        setError('Failed to load your samples');
        toast.error('Failed to load your samples');
      } finally {
        setLoading(false);
      }
    }

    fetchSamples();
  }, [user, supabase]);

  const handleDeleteClick = (sample: Sample) => {
    setSampleToDelete(sample);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sampleToDelete) return;
    
    setDeleting(sampleToDelete.id.toString());
    try {
      const { error } = await supabase
        .from('samples')
        .delete()
        .eq('id', sampleToDelete.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSamples(samples.filter(s => s.id !== sampleToDelete.id));
      toast.success('Sample deleted successfully');
    } catch (err) {
      console.error('Error deleting sample:', err);
      toast.error('Failed to delete sample');
    } finally {
      setDeleting(null);
      setShowDeleteModal(false);
      setSampleToDelete(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-orange-500" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Samples</h1>
            <Link 
              href="/samples/upload" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add New Sample
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-orange-500" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="ml-4 text-gray-600">Loading your samples...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading samples</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : samples.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-4">No Samples Found</h3>
              <p className="text-gray-600 mb-6">You haven't uploaded any samples yet.</p>
              <Link 
                href="/samples/upload" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Your First Sample
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sample
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Added
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {samples.map((sample) => (
                    <tr key={sample.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {sample.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {sample.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {sample.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sample.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${sample.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sample.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/sample-details?id=${sample.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          View
                        </Link>
                        <Link
                          href={`/sample-details?id=${sample.id}&edit=true`}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(sample)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleting === sample.id.toString()}
                        >
                          <FontAwesomeIcon icon={faTrash} className="mr-1" />
                          {deleting === sample.id.toString() ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && sampleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the sample "{sampleToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSampleToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!!deleting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 