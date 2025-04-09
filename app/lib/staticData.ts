// Static sample data for use in static export builds
// This data will be used when the site is deployed to Cloudflare Pages

import { Sample } from '@/types/sample';

export const staticSamples: Sample[] = [
  {
    id: '1',
    name: 'Arctic Ice Core',
    type: 'environmental',
    description: 'Deep ice core sample from Greenland ice sheet, containing valuable climate data.',
    price: 1499.99,
    latitude: 72.5863,
    longitude: -38.4557,
    collection_date: '2023-08-15',
    storage_condition: 'frozen',
    quantity: 3,
    hash: 'abc123',
    created_at: '2023-08-15T12:00:00Z',
    updated_at: '2023-08-15T12:00:00Z',
    inStock: true,
    location: 'Greenland Ice Sheet'
  },
  {
    id: '2',
    name: 'Marine Bacterial Culture',
    type: 'bacterial',
    description: 'Unique bacterial strain isolated from deep-sea hydrothermal vents.',
    price: 899.99,
    latitude: -0.8667,
    longitude: -13.2833,
    collection_date: '2023-07-20',
    storage_condition: 'refrigerated',
    quantity: 5,
    hash: 'def456',
    created_at: '2023-07-20T12:00:00Z',
    updated_at: '2023-07-20T12:00:00Z',
    inStock: true,
    location: 'Mid-Atlantic Ridge'
  },
  {
    id: '3',
    name: 'Cell Line A549',
    type: 'cell line',
    description: 'Human lung carcinoma cell line for cancer research.',
    price: 1299.99,
    latitude: 40.7128,
    longitude: -74.0060,
    collection_date: '2023-09-01',
    storage_condition: 'cryogenic',
    quantity: 0,
    hash: 'ghi789',
    created_at: '2023-09-01T12:00:00Z',
    updated_at: '2023-09-01T12:00:00Z',
    inStock: false,
    location: 'New York Research Center'
  },
  {
    id: '4',
    name: 'Tropical Soil Sample',
    type: 'soil',
    description: 'Rich soil sample from Amazon rainforest with unique microbial composition.',
    price: 799.99,
    latitude: -3.4653,
    longitude: -62.2159,
    collection_date: '2023-11-01',
    storage_condition: 'room temperature',
    quantity: 8,
    hash: 'jkl012',
    created_at: '2023-11-01T12:00:00Z',
    updated_at: '2023-11-01T12:00:00Z',
    inStock: true,
    location: 'Amazon Rainforest'
  },
  {
    id: '5',
    name: 'Volcanic Rock Sample',
    type: 'geological',
    description: 'Fresh volcanic rock sample from recent eruption.',
    price: 599.99,
    latitude: 19.4069,
    longitude: -155.2834,
    collection_date: '2023-12-15',
    storage_condition: 'room temperature',
    quantity: 6,
    hash: 'mno345',
    created_at: '2023-12-15T12:00:00Z',
    updated_at: '2023-12-15T12:00:00Z',
    inStock: true,
    location: 'Kilauea Volcano, Hawaii'
  },
  {
    id: '6',
    name: 'Plant Tissue Culture',
    type: 'botanical',
    description: 'Rare orchid tissue culture for conservation research.',
    price: 699.99,
    latitude: -0.9537,
    longitude: -90.9656,
    collection_date: '2024-01-10',
    storage_condition: 'refrigerated',
    quantity: 4,
    hash: 'pqr678',
    created_at: '2024-01-10T12:00:00Z',
    updated_at: '2024-01-10T12:00:00Z',
    inStock: true,
    location: 'Galapagos Islands'
  }
];

// Function to get all samples
export function getStaticSamples(): Sample[] {
  return staticSamples;
}

// Function to get a sample by ID
export function getStaticSampleById(id: string): Sample | undefined {
  return staticSamples.find(sample => sample.id === id);
}

// Function to check if we're in static export mode
export function isStaticExport(): boolean {
  // Check if we have Supabase credentials from environment variables
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const useStatic = !hasSupabaseUrl || !hasSupabaseKey;
  console.log(`[staticData] isStaticExport check: URL found=${hasSupabaseUrl}, Key found=${hasSupabaseKey}. Using Static=${useStatic}`);
  
  // If we don't have credentials (or they are invalid according to Supabase client init), 
  // we assume we should be in static mode.
  return useStatic;
} 