import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import SampleMap from '../components/SampleMap';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sample } from '../types/sample';

export async function loader() {
  const { data: samples, error } = await supabase
    .from('samples')
    .select('*');

  if (error) {
    throw new Error('Failed to fetch samples');
  }

  // Transform the data to ensure it matches the Sample interface
  const transformedSamples: Sample[] = (samples || []).map((sample: any) => ({
    id: Number(sample.id),
    name: sample.name,
    type: sample.type,
    location: sample.location,
    collection_date: sample.collection_date,
    storage: sample.storage,
    availability: sample.availability,
    price: sample.price ? Number(sample.price) : 0,
    latitude: Number(sample.latitude),
    longitude: Number(sample.longitude),
    description: sample.description || '',
    inStock: sample.in_stock || false,
    user_id: sample.user_id || '',
    created_at: sample.created_at || new Date().toISOString()
  }));

  return json({ samples: transformedSamples });
}

export default function Samples() {
  const { samples } = useLoaderData<typeof loader>();
  const [viewType, setViewType] = useState('table');
  const [visibleSamples, setSamples] = useState<Sample[]>([]);

  useEffect(() => {
    const fetchSamples = async () => {
      const { data, error } = await supabase
        .from('samples')
        .select('*');

      if (error) {
        console.error('Error fetching samples:', error);
        return;
      }

      // Transform the data to ensure it matches the Sample interface
      const transformedSamples: Sample[] = data.map((sample: any) => ({
        id: Number(sample.id),
        name: sample.name,
        type: sample.type,
        location: sample.location,
        collection_date: sample.collection_date,
        storage: sample.storage,
        availability: sample.availability,
        price: sample.price ? Number(sample.price) : 0,
        latitude: Number(sample.latitude),
        longitude: Number(sample.longitude),
        description: sample.description || '',
        inStock: sample.in_stock || false,
        user_id: sample.user_id || '',
        created_at: sample.created_at || new Date().toISOString()
      }));

      setSamples(transformedSamples);
    };

    fetchSamples();
  }, []);

  const sampleTypes = [
    { name: 'Bacterial', color: '#82ca9d' },
    { name: 'Tissue', color: '#ff6b6b' },
    { name: 'Botanical', color: '#82ca9d' },
    { name: 'Soil', color: '#8b4513' },
    { name: 'Viral', color: '#ff1493' },
    { name: 'Cell Line', color: '#ff69b4' },
    { name: 'DNA', color: '#9370db' },
    { name: 'Environmental', color: '#20b2aa' },
    { name: 'Ice Core', color: '#87ceeb' },
    { name: 'Industrial Strain', color: '#3cb371' },
    { name: 'Water Sample', color: '#4169e1' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Available Samples</h1>
        <div className="flex gap-4 mb-4">
          <button onClick={() => setViewType('list')}>List View</button>
          <button onClick={() => setViewType('map')}>Map View</button>
          <button onClick={() => setViewType('table')}>Table View</button>
        </div>
      </div>

      {viewType === 'table' && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Collection Date</th>
                <th className="px-4 py-2">Storage</th>
                <th className="px-4 py-2">Availability</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {visibleSamples.map((sample: Sample) => (
                <tr key={sample.id} className="border-b">
                  <td className="px-4 py-2">{sample.name}</td>
                  <td className="px-4 py-2">{sample.type}</td>
                  <td className="px-4 py-2">{sample.location}</td>
                  <td className="px-4 py-2">{sample.collection_date}</td>
                  <td className="px-4 py-2">{sample.storage}</td>
                  <td className="px-4 py-2">{sample.availability}</td>
                  <td className="px-4 py-2">${sample.price || 0}</td>
                  <td className="px-4 py-2">
                    <button className="text-blue-500">Info</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Sample Locations</h2>
        {typeof window !== 'undefined' ? (
          <SampleMap 
            samples={visibleSamples} 
            onBoundsChange={(ids) => {
              console.log('Visible samples:', ids);
            }} 
          />
        ) : (
          <div>Loading map...</div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Sample Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sampleTypes.map((type) => (
            <div key={type.name} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: type.color }}
              ></div>
              <span>{type.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 