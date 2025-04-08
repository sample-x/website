'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabase } from '@/app/supabase-provider';
import { useAuth } from '@/app/auth/AuthProvider';
import { Sample } from '@/types/sample';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faTrash, faShoppingCart, faSave } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useCart } from '@/app/context/CartContext';

export default function SampleDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sampleId = searchParams.get('id');
  const [editMode, setEditMode] = useState(false);
  
  const { supabase } = useSupabase();
  const { user, isLoading: authLoading } = useAuth();
  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    collection_date: '',
    storage_condition: '',
    quantity: 1,
    price: 0,
    description: '',
    latitude: null as number | null,
    longitude: null as number | null
  });
  
  // Sample types list for dropdown
  const sampleTypes = [
    'bacterial', 'viral', 'fungal', 'tissue', 'environmental', 
    'cell line', 'soil', 'botanical', 'dna', 'water', 'industrial'
  ];

  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Fetch sample data
  useEffect(() => {
    async function fetchSample() {
      if (!sampleId) {
        setError('No sample ID provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('samples')
          .select('*')
          .eq('id', sampleId)
          .single();

        if (fetchError) {
          console.error('Error fetching sample:', fetchError);
          setError(`Failed to load sample: ${fetchError.message}`);
          throw fetchError;
        }
        
        setSample(data);
        
        // Set form data
        setFormData({
          name: data.name || '',
          type: data.type || '',
          location: data.location || '',
          collection_date: data.collection_date || '',
          storage_condition: data.storage_condition || '',
          quantity: data.quantity || 1,
          price: data.price || 0,
          description: data.description || '',
          latitude: data.latitude,
          longitude: data.longitude
        });
        
        // Check if the current user is the owner of the sample
        if (user && data.user_id === user.id) {
          setIsOwner(true);
        }
        
        setError(null);
      } catch (catchError) {
        console.error('Error in fetchSample:', catchError);
        if (!error) {
          setError(`An unexpected error occurred: ${(catchError as Error).message}`);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSample();
  }, [sampleId, supabase, user]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' 
        ? parseFloat(value) 
        : name === 'latitude' || name === 'longitude' 
          ? value ? parseFloat(value) : null 
          : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sample || !user) return;
    
    // Form validation
    if (!formData.name.trim()) {
      toast.error('Sample name is required');
      return;
    }
    
    if (!formData.type) {
      toast.error('Sample type is required');
      return;
    }
    
    setSaving(true);
    
    try {
      const { error: updateError } = await supabase
        .from('samples')
        .update({
          name: formData.name,
          type: formData.type,
          location: formData.location,
          collection_date: formData.collection_date,
          storage_condition: formData.storage_condition,
          quantity: formData.quantity,
          price: formData.price,
          description: formData.description,
          latitude: formData.latitude,
          longitude: formData.longitude
        })
        .eq('id', sample.id);
      
      if (updateError) {
        throw updateError;
      }
      
      toast.success('Sample updated successfully');
      setEditMode(false);
    } catch (err) {
      console.error('Error updating sample:', err);
      toast.error('Failed to update sample');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('samples')
        .delete()
        .eq('id', sampleId);

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
      toast.error('Failed to delete sample');
    } finally {
      setDeleting(false);
    }
  };

  // Loading state
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

  // Error state
  if (error || !sample) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 p-6 rounded-lg max-w-lg w-full">
          <h2 className="text-red-800 text-xl mb-4 font-bold">Error</h2>
          <p className="text-red-600 mb-6">{error || 'Sample not found'}</p>
          <Link
            href="/samples/my-samples"
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
              href="/samples/my-samples"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Samples
            </Link>
            
            {isOwner && !editMode && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setEditMode(true)}
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
              <h1 className="text-2xl font-bold">
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 rounded px-2 py-1"
                    placeholder="Sample Name"
                  />
                ) : (
                  sample.name
                )}
              </h1>
              <div className="flex mt-2">
                {editMode ? (
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="text-sm bg-white/10 text-white px-3 py-1 rounded-full"
                  >
                    <option value="">Select type</option>
                    {sampleTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm bg-white/20 text-white px-3 py-1 rounded-full">
                    {sample.type}
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Sample Details</h2>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-500">Location</p>
                          {editMode ? (
                            <input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              className="w-full bg-white rounded px-2 py-1 mt-1"
                              placeholder="Sample Location"
                            />
                          ) : (
                            <p className="font-medium">{sample.location}</p>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-500">Collection Date</p>
                          {editMode ? (
                            <input
                              type="date"
                              name="collection_date"
                              value={formData.collection_date}
                              onChange={handleChange}
                              className="w-full bg-white rounded px-2 py-1 mt-1"
                            />
                          ) : (
                            <p className="font-medium">{sample.collection_date}</p>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-500">Storage Condition</p>
                          {editMode ? (
                            <input
                              type="text"
                              name="storage_condition"
                              value={formData.storage_condition}
                              onChange={handleChange}
                              className="w-full bg-white rounded px-2 py-1 mt-1"
                              placeholder="e.g., -20°C, Room temperature"
                            />
                          ) : (
                            <p className="font-medium">{sample.storage_condition}</p>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-500">Price</p>
                          {editMode ? (
                            <input
                              type="number"
                              name="price"
                              value={formData.price}
                              onChange={handleChange}
                              min="0"
                              step="0.01"
                              className="w-full bg-white rounded px-2 py-1 mt-1"
                            />
                          ) : (
                            <p className="font-medium">${sample.price.toFixed(2)}</p>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-500">Quantity Available</p>
                          {editMode ? (
                            <input
                              type="number"
                              name="quantity"
                              value={formData.quantity}
                              onChange={handleChange}
                              min="1"
                              className="w-full bg-white rounded px-2 py-1 mt-1"
                            />
                          ) : (
                            <p className="font-medium">{sample.quantity}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        {editMode ? (
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-white rounded px-2 py-1 mt-1"
                            placeholder="Sample description..."
                          ></textarea>
                        ) : (
                          <p className="whitespace-pre-line">{sample.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Location Information</h2>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Latitude</p>
                        {editMode ? (
                          <input
                            type="number"
                            name="latitude"
                            value={formData.latitude === null ? '' : formData.latitude}
                            onChange={handleChange}
                            step="0.000001"
                            min="-90"
                            max="90"
                            className="w-full bg-white rounded px-2 py-1 mt-1"
                          />
                        ) : (
                          <div className="flex flex-col">
                            <p className="text-sm text-gray-500">Coordinates</p>
                            <p className="font-medium">
                              {sample.latitude}, {sample.longitude}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Longitude</p>
                        {editMode ? (
                          <input
                            type="number"
                            name="longitude"
                            value={formData.longitude === null ? '' : formData.longitude}
                            onChange={handleChange}
                            step="0.000001"
                            min="-180"
                            max="180"
                            className="w-full bg-white rounded px-2 py-1 mt-1"
                          />
                        ) : (
                          <div className="flex flex-col">
                            <p className="text-sm text-gray-500">Coordinates</p>
                            <p className="font-medium">
                              {sample.latitude}, {sample.longitude}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!isOwner && (
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center space-x-4">
                          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                            Quantity
                          </label>
                          <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            min="1"
                            max={sample.quantity}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setAddingToCart(true);
                            addToCart(sample, quantity);
                            setAddingToCart(false);
                          }}
                          disabled={addingToCart}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600"
                        >
                          <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                          {addingToCart ? 'Adding...' : 'Add to Cart'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {editMode && (
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 