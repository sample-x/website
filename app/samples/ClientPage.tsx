'use client';

import SampleMap from '../components/SampleMap';
import { useState, useCallback } from 'react';
import { Sample } from '../types/sample';  // adjust the import path as needed

interface PopupInfo {
  isOpen: boolean;
  sample: Sample | null;
}

const samples: Sample[] = [
  {
    id: "1",
    name: "Human Blood Plasma",
    type: "tissue",
    location: "Seattle, WA",
    collection_date: "2023-05-14",
    storage: "-80°C",
    availability: "available",
    price: 120.00,
    latitude: 47.6062,
    longitude: -122.3321,
    description: "Fresh human blood plasma sample",
    inStock: true,
    user_id: "system",
    created_at: "2023-05-14T00:00:00Z"
  },
  {
    id: "2",
    name: "Mouse Brain Tissue",
    type: "tissue",
    location: "Boston, MA",
    collection_date: "2023-04-19",
    storage: "Room temperature (fixed)",
    availability: "limited",
    price: 180.00,
    latitude: 42.3601,
    longitude: -71.0589,
    description: "Fixed mouse brain tissue sample",
    inStock: true,
    user_id: "system",
    created_at: "2023-04-19T00:00:00Z"
  },
  {
    id: "3",
    name: "E. coli Culture",
    type: "bacterial",
    location: "Chicago, IL",
    collection_date: "2023-05-31",
    storage: "4°C",
    availability: "available",
    price: 75.00,
    latitude: 41.8781,
    longitude: -87.6298,
    description: "E. coli culture sample",
    inStock: true,
    user_id: "system",
    created_at: "2023-05-31T00:00:00Z"
  },
  {
    id: "4",
    name: "Soil Sample from Amazon Rainforest",
    type: "environmental",
    location: "Manaus, Brazil",
    collection_date: "2023-03-09",
    storage: "Room temperature",
    availability: "available",
    price: 95.00,
    latitude: -3.1190,
    longitude: -60.0217,
    description: "Soil sample from the Amazon rainforest",
    inStock: true,
    user_id: "system",
    created_at: "2023-03-09T00:00:00Z"
  },
  {
    id: "5",
    name: "Human Lung Cell Line",
    type: "cell line",
    location: "San Francisco, CA",
    collection_date: "2023-05-04",
    storage: "Liquid nitrogen",
    availability: "limited",
    price: 210.00,
    latitude: 37.7749,
    longitude: -122.4194,
    description: "Human lung cell line sample",
    inStock: true,
    user_id: "system",
    created_at: "2023-05-04T00:00:00Z"
  }
];

export default function ClientPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [visibleSamples, setVisibleSamples] = useState(samples);
  const [popupInfo, setPopupInfo] = useState<PopupInfo>({ isOpen: false, sample: null });

  // Callback for when map bounds change
  const handleMapBoundsChange = useCallback((visibleSampleIds: string[]) => {
    const filtered = samples.filter(sample => visibleSampleIds.includes(sample.id));
    setVisibleSamples(filtered);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-3">Browse Samples</h1>
        <p className="text-center text-gray-600">
          Discover and browse scientific samples from researchers around the world.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
        <input
          type="text"
          placeholder="Search samples..."
          className="border border-gray-300 rounded-md px-4 py-2 w-64 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option>All Types</option>
          <option>tissue</option>
          <option>bacterial</option>
          <option>cell line</option>
          <option>environmental</option>
          <option>ice core</option>
        </select>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Price Range:</span>
          <input
            type="number"
            min="0"
            placeholder="Min"
            className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
          />
          <span className="text-gray-600">to</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Updated Table */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr>
              <th className="border-b px-4 py-2 text-left">Name</th>
              <th className="border-b px-4 py-2 text-left">Type</th>
              <th className="border-b px-4 py-2 text-left">Location</th>
              <th className="border-b px-4 py-2 text-left">Collection Date</th>
              <th className="border-b px-4 py-2 text-left">Storage</th>
              <th className="border-b px-4 py-2 text-left">Availability</th>
              <th className="border-b px-4 py-2 text-left">Price</th>
              <th className="border-b px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleSamples.map((sample, index) => (
              <tr key={sample.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{sample.name}</td>
                <td className="px-4 py-2">{sample.type}</td>
                <td className="px-4 py-2">{sample.location}</td>
                <td className="px-4 py-2">{sample.collection_date}</td>
                <td className="px-4 py-2">{sample.storage}</td>
                <td className="px-4 py-2">{sample.availability}</td>
                <td className="px-4 py-2">${sample.price.toFixed(2)}</td>
                <td className="px-4 py-2">
                  <button 
                    onClick={() => setPopupInfo({ isOpen: true, sample: sample })}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    Details
                  </button>
                  <button className="text-blue-600 hover:underline">
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sample Details Popup */}
      {popupInfo.isOpen && popupInfo.sample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{popupInfo.sample.name}</h3>
              <button 
                onClick={() => setPopupInfo({ isOpen: false, sample: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Type:</span> {popupInfo.sample.type}</p>
              <p><span className="font-semibold">Location:</span> {popupInfo.sample.location}</p>
              <p><span className="font-semibold">Collection Date:</span> {popupInfo.sample.collection_date}</p>
              <p><span className="font-semibold">Storage:</span> {popupInfo.sample.storage}</p>
              <p><span className="font-semibold">Availability:</span> {popupInfo.sample.availability}</p>
              <p><span className="font-semibold">Price:</span> ${popupInfo.sample.price.toFixed(2)}</p>
            </div>
            <button 
              className="mt-4 w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
              onClick={() => {
                // Add to cart logic here
                alert('Added to cart!');
                setPopupInfo({ isOpen: false, sample: null });
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Map Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Sample Locations</h2>
        <SampleMap 
          samples={samples} 
          onBoundsChange={handleMapBoundsChange}
        />
      </div>
    </div>
  );
} 