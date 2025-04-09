'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthProvider';
import { useSupabase } from '@/app/supabase-provider';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Sample } from '@/app/types/sample';
import { getSampleTypeColor } from '@/app/lib/sampleColors';

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
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);

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

  // Handle "Add to Marketplace" button click
  const handleAddToMarketplace = async (sample: Sample) => {
    if (!user) return;
    
    setUpdating(sample.id.toString());
    try {
      const { error } = await supabase
        .from('samples')
        .update({ status: 'public' })
        .eq('id', sample.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSamples(samples.map(s => {
        if (s.id === sample.id) {
          return { ...s, status: 'public' };
        }
        return s;
      }));
      
      toast.success('Sample added to marketplace successfully');
    } catch (err) {
      console.error('Error updating sample:', err);
      toast.error('Failed to add sample to marketplace');
    } finally {
      setUpdating(null);
    }
  };

  // Handle "Remove from Marketplace" button click
  const handleRemoveFromMarketplace = async (sample: Sample) => {
    if (!user) return;
    
    setUpdating(sample.id.toString());
    try {
      const { error } = await supabase
        .from('samples')
        .update({ status: 'private' })
        .eq('id', sample.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSamples(samples.map(s => {
        if (s.id === sample.id) {
          return { ...s, status: 'private' };
        }
        return s;
      }));
      
      toast.success('Sample removed from marketplace successfully');
    } catch (err) {
      console.error('Error updating sample:', err);
      toast.error('Failed to remove sample from marketplace');
    } finally {
      setUpdating(null);
    }
  };

  // Handle toggling edit mode for a field
  const handleEdit = (sample: Sample, field: string) => {
    setEditingId(sample.id.toString());
    setEditField(field);
    setEditValue(sample[field]?.toString() || '');
    
    // Focus the input after a small delay to ensure it's rendered
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 50);
  };

  // Handle saving the edit
  const handleSaveEdit = async () => {
    if (!editingId || !editField) return;
    
    setUpdating(editingId);
    try {
      // Validate edit value
      if (editField === 'price' && (isNaN(parseFloat(editValue)) || parseFloat(editValue) < 0)) {
        toast.error('Price must be a valid positive number');
        return;
      }
      
      if (editField === 'quantity' && (isNaN(parseInt(editValue)) || parseInt(editValue) < 0)) {
        toast.error('Quantity must be a valid positive number');
        return;
      }
      
      // Prepare the update object
      const updateData: any = {};
      updateData[editField] = 
        editField === 'price' ? parseFloat(editValue) :
        editField === 'quantity' ? parseInt(editValue) :
        editValue;
      
      // Update in database
      const { error } = await supabase
        .from('samples')
        .update(updateData)
        .eq('id', editingId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSamples(samples.map(s => {
        if (s.id.toString() === editingId) {
          return { ...s, [editField]: updateData[editField] };
        }
        return s;
      }));
      
      toast.success('Sample updated successfully');
      
      // Reset edit state
      setEditingId(null);
      setEditField(null);
    } catch (err) {
      console.error('Error updating sample:', err);
      toast.error('Failed to update sample');
    } finally {
      setUpdating(null);
    }
  };

  // Handle cancelling the edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditField(null);
  };

  // Handle key press events in edit input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Render editable field based on current editing state
  const renderEditableField = (sample: Sample, field: string, displayValue: React.ReactNode) => {
    const isEditing = editingId === sample.id.toString() && editField === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center">
          <input
            ref={editInputRef}
            type={field === 'price' || field === 'quantity' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            className="px-2 py-1 border border-gray-300 rounded w-full"
            min={field === 'price' || field === 'quantity' ? 0 : undefined}
            step={field === 'price' ? 0.01 : undefined}
          />
        </div>
      );
    }
    
    return (
      <div 
        className="editable-field cursor-pointer hover:bg-gray-50 px-2 py-1 rounded flex items-center"
        onClick={() => handleEdit(sample, field)}
      >
        {displayValue}
        <span className="ml-1 text-gray-400 text-xs">
          <FontAwesomeIcon icon={faEdit} />
        </span>
      </div>
    );
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
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow-md rounded-md">
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
                          Ownership
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
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
                                  {renderEditableField(
                                    sample, 
                                    'name', 
                                    sample.name
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                  {sample.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                              style={{ backgroundColor: getSampleTypeColor(sample.type) }}
                            >
                              {sample.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sample.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {renderEditableField(
                              sample, 
                              'price',
                              `$${sample.price.toFixed(2)}`
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="text-xs">
                              {sample.institution_name && (
                                <div className="mb-1">
                                  <span className="font-semibold">Institution:</span> {sample.institution_name}
                                </div>
                              )}
                              {sample.sample_owner_id === user?.id && (
                                <div className="text-green-600 font-semibold">
                                  You are the owner
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sample.status === 'public' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Public
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Private
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/samples/${sample.id}`}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              View
                            </Link>
                            <Link
                              href={`/samples/edit/${sample.id}`}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-1" />
                              Edit
                            </Link>
                            
                            {sample.status === 'private' ? (
                              <button
                                onClick={() => handleAddToMarketplace(sample)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                                disabled={updating === sample.id.toString()}
                              >
                                {updating === sample.id.toString() ? (
                                  <span>Adding...</span>
                                ) : (
                                  <>
                                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                    Add to Marketplace
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRemoveFromMarketplace(sample)}
                                className="text-yellow-600 hover:text-yellow-900 mr-3"
                                disabled={updating === sample.id.toString()}
                              >
                                {updating === sample.id.toString() ? (
                                  <span>Removing...</span>
                                ) : (
                                  <>
                                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                    Remove from Marketplace
                                  </>
                                )}
                              </button>
                            )}
                            
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
              </div>
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