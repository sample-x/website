'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/supabase-provider';
import { useAuth } from '@/app/auth/AuthProvider';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { Sample } from '@/types/sample';

// Update the FormData interface to include new fields
interface FormData {
  name: string;
  type: string;
  location: string;
  collection_date: string;
  storage_condition: string;
  quantity: number;
  price: number;
  description: string;
  latitude: number | null;
  longitude: number | null;
  institution_name: string;
  institution_contact_name: string;
  institution_contact_email: string;
}

export default function EditSampleClient({ id }: { id: string }) {
  const { supabase } = useSupabase();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sample, setSample] = useState<Sample | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    location: '',
    collection_date: '',
    storage_condition: '',
    quantity: 1,
    price: 0,
    description: '',
    latitude: null,
    longitude: null,
    institution_name: '',
    institution_contact_name: '',
    institution_contact_email: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Sample types list for dropdown
  const sampleTypes = [
    'bacterial', 'viral', 'fungal', 'tissue', 'environmental', 
    'cell line', 'soil', 'botanical', 'dna', 'water', 'industrial'
  ];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch sample data
  useEffect(() => {
    async function fetchSample() {
      if (!user) return;
      
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
        
        // Check if the sample belongs to the user
        if (data.user_id !== user.id) {
          toast.error('You do not have permission to edit this sample');
          router.push('/samples/my-samples');
          return;
        }
        
        setSample(data as Sample);
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
          longitude: data.longitude,
          institution_name: data.institution_name || '',
          institution_contact_name: data.institution_contact_name || '',
          institution_contact_email: data.institution_contact_email || ''
        });
      } catch (err) {
        console.error('Error fetching sample:', err);
        toast.error('Failed to load sample');
        router.push('/samples/my-samples');
      } finally {
        setLoading(false);
      }
    }

    fetchSample();
  }, [user, supabase, id, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!user || !sample) return;
    
    // Validate form data
    if (!formData.name.trim()) {
      setFormError('Sample name is required');
      return;
    }
    
    if (!formData.type) {
      setFormError('Sample type is required');
      return;
    }
    
    if (!formData.location.trim()) {
      setFormError('Location is required');
      return;
    }
    
    if (!formData.collection_date) {
      setFormError('Collection date is required');
      return;
    }
    
    if (!formData.storage_condition.trim()) {
      setFormError('Storage condition is required');
      return;
    }
    
    if (formData.quantity < 1) {
      setFormError('Quantity must be at least 1');
      return;
    }
    
    if (formData.price < 0) {
      setFormError('Price cannot be negative');
      return;
    }
    
    setSaving(true);
    
    try {
      const { error } = await supabase
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
          longitude: formData.longitude,
          institution_name: formData.institution_name,
          institution_contact_name: formData.institution_contact_name,
          institution_contact_email: formData.institution_contact_email
        })
        .eq('id', sample.id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Sample updated successfully');
      router.push('/samples/my-samples');
    } catch (err) {
      console.error('Error updating sample:', err);
      toast.error('Failed to update sample');
      setFormError('Failed to update sample. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
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
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Sample</h1>
            <Link 
              href="/samples/my-samples" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to My Samples
            </Link>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Sample Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Sample Type*
                  </label>
                  <select
                    id="type"
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select type</option>
                    {sampleTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location*
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="collection_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Collection Date*
                  </label>
                  <input
                    type="date"
                    id="collection_date"
                    name="collection_date"
                    required
                    value={formData.collection_date}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="storage_condition" className="block text-sm font-medium text-gray-700 mb-1">
                    Storage Condition*
                  </label>
                  <input
                    type="text"
                    id="storage_condition"
                    name="storage_condition"
                    required
                    value={formData.storage_condition}
                    onChange={handleChange}
                    placeholder="e.g., -20°C, Room temperature"
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity*
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)*
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    min="-90"
                    max="90"
                    step="0.000001"
                    value={formData.latitude === null ? '' : formData.latitude}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    min="-180"
                    max="180"
                    step="0.000001"
                    value={formData.longitude === null ? '' : formData.longitude}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                ></textarea>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Institution & Contact Information</h3>
                <p className="text-sm text-gray-500 mb-4">
                  This information will be visible to administrators and sample owners, 
                  but only the institution name will be shown publicly.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="institution_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      id="institution_name"
                      name="institution_name"
                      value={formData.institution_name}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="institution_contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      id="institution_contact_name"
                      name="institution_contact_name"
                      value={formData.institution_contact_name}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="institution_contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="institution_contact_email"
                      name="institution_contact_email"
                      value={formData.institution_contact_email}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 