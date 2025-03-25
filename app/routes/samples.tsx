import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import SampleMap from '../components/SampleMap';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sample } from '../types/sample';

export async function loader() {
  const samples: Sample[] = [
    {
      "id": "1",
      "name": "Human Blood Plasma",
      "type": "tissue",
      "location": "Seattle, WA",
      "collection_date": "2023-05-14",
      "storage": "-80°C",
      "availability": "available",
      "price": 120.00,
      "latitude": 47.6062,
      "longitude": -122.3321,
      "description": "Fresh human blood plasma sample",
      "inStock": true,
      "user_id": "system",
      "created_at": "2023-05-14T00:00:00Z"
    },
    {
      "id": "2",
      "name": "Mouse Brain Tissue",
      "type": "tissue",
      "location": "Boston, MA",
      "collection_date": "2023-04-19",
      "storage": "Room temperature (fixed)",
      "availability": "limited",
      "price": 180.00,
      "latitude": 42.3601,
      "longitude": -71.0589,
      "description": "Fixed mouse brain tissue sample",
      "inStock": true,
      "user_id": "system",
      "created_at": "2023-04-19T00:00:00Z"
    },
    {
      "id": "3",
      "name": "E. coli Culture",
      "type": "bacterial",
      "location": "Chicago, IL",
      "collection_date": "2023-05-31",
      "storage": "4°C",
      "availability": "available",
      "price": 75.00,
      "latitude": 41.8781,
      "longitude": -87.6298,
      "description": "E. coli strain for research",
      "inStock": true,
      "user_id": "system",
      "created_at": "2023-05-31T00:00:00Z"
    },
    {
      "id": "4",
      "name": "Soil Sample from Amazon Rainforest",
      "type": "environmental",
      "location": "Manaus, Brazil",
      "collection_date": "2023-03-09",
      "storage": "Room temperature",
      "availability": "available",
      "price": 95.00,
      "latitude": -3.1190,
      "longitude": -60.0217,
      "description": "Rich soil sample from Amazon",
      "inStock": true,
      "user_id": "system",
      "created_at": "2023-03-09T00:00:00Z"
    },
    {
      "id": "5",
      "name": "Human Lung Cell Line",
      "type": "cell line",
      "location": "San Francisco, CA",
      "collection_date": "2023-05-04",
      "storage": "Liquid nitrogen",
      "availability": "limited",
      "price": 210.00,
      "latitude": 37.7749,
      "longitude": -122.4194,
      "description": "Human lung epithelial cells",
      "inStock": true,
      "user_id": "system",
      "created_at": "2023-05-04T00:00:00Z"
    }
  ];
  return json({ samples });
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
        id: sample.id.toString(),
        name: sample.name,
        type: sample.type,
        location: sample.location,
        collection_date: sample.collection_date,
        storage: sample.storage,
        availability: sample.availability,
        price: Number(sample.price),
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
              {visibleSamples.map((sample: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{sample.name}</td>
                  <td className="px-4 py-2">{sample.type}</td>
                  <td className="px-4 py-2">{sample.location}</td>
                  <td className="px-4 py-2">{sample.collection_date}</td>
                  <td className="px-4 py-2">{sample.storage}</td>
                  <td className="px-4 py-2">{sample.availability}</td>
                  <td className="px-4 py-2">${sample.price}</td>
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