// Static sample data for use in static export builds
// This data will be used when the site is deployed to Cloudflare Pages

import { Sample } from '@/types/sample';

export const staticSamples: Sample[] = [
  {
    id: 1,
    name: 'Arctic Ice Core Sample',
    type: 'ice core',
    location: 'Greenland',
    collection_date: '2023-01-15',
    storage_condition: 'Ultra-Low (-80°C)',
    quantity: 5,
    price: 599.99,
    description: 'Ice core sample extracted from the Arctic ice sheet, perfect for climate research and analysis of historical atmospheric conditions.',
    latitude: 72.5863,
    longitude: -38.4554,
    created_at: '2023-01-20T08:30:00Z'
  },
  {
    id: 2,
    name: 'Deep Sea Sediment',
    type: 'soil sample',
    location: 'Mariana Trench',
    collection_date: '2023-03-10',
    storage_condition: 'Refrigerated (2-8°C)',
    quantity: 8,
    price: 349.99,
    description: 'Deep sea sediment collected from the Mariana Trench at a depth of approximately 10,000 meters. Rich in unique microbial life.',
    latitude: 11.3548,
    longitude: 142.1995,
    created_at: '2023-03-15T14:20:00Z'
  },
  {
    id: 3,
    name: 'Yellowstone Thermal Vent Bacteria',
    type: 'bacterial culture',
    location: 'Yellowstone National Park, USA',
    collection_date: '2023-02-05',
    storage_condition: 'Frozen (-20°C)',
    quantity: 12,
    price: 249.99,
    description: 'Thermophilic bacterial culture collected from hot springs in Yellowstone National Park. Includes extremophiles that thrive in temperatures above 70°C.',
    latitude: 44.4280,
    longitude: -110.5885,
    created_at: '2023-02-10T10:15:00Z'
  },
  {
    id: 4,
    name: 'Amazon Rainforest Soil',
    type: 'soil sample',
    location: 'Amazon Rainforest, Brazil',
    collection_date: '2023-04-20',
    storage_condition: 'Room Temperature',
    quantity: 15,
    price: 199.99,
    description: 'Rich soil sample from the Amazon rainforest floor, containing diverse microorganisms and organic matter essential for biodiversity studies.',
    latitude: -3.4653,
    longitude: -62.2159,
    created_at: '2023-04-25T09:45:00Z'
  },
  {
    id: 5,
    name: 'Human Lung Epithelial Cells',
    type: 'cell line',
    location: 'Boston, USA',
    collection_date: '2023-01-30',
    storage_condition: 'Liquid Nitrogen (-196°C)',
    quantity: 7,
    price: 799.99,
    description: 'Primary human lung epithelial cell line suitable for respiratory disease research and drug testing applications.',
    latitude: 42.3601,
    longitude: -71.0589,
    created_at: '2023-02-05T11:30:00Z'
  },
  {
    id: 6,
    name: 'Sahara Desert Sand',
    type: 'mineral sample',
    location: 'Sahara Desert, Morocco',
    collection_date: '2023-05-15',
    storage_condition: 'Room Temperature',
    quantity: 20,
    price: 149.99,
    description: 'Fine sand sample from the Sahara Desert with unique mineral composition and microbial communities adapted to extreme dryness.',
    latitude: 31.7917,
    longitude: -7.0926,
    created_at: '2023-05-20T16:10:00Z'
  }
];

// Function to get all samples
export function getStaticSamples(): Sample[] {
  return staticSamples;
}

// Function to get a sample by ID
export function getStaticSampleById(id: number): Sample | undefined {
  return staticSamples.find(sample => sample.id === id);
}

// Function to check if we're in static export mode
export function isStaticExport(): boolean {
  // Check if we have Supabase environment variables
  const hasSupabaseUrl = typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined';
  const hasSupabaseKey = typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'undefined';
  
  // If we have both Supabase environment variables, we're not in static mode
  if (hasSupabaseUrl && hasSupabaseKey) {
    return false;
  }

  // Otherwise, default to static mode
  return true;
} 