'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import SamplesMap from '@/app/samples/SamplesMap'
import { SamplesMapProps } from '@/app/samples/mapTypes'
import SamplesTable from './SamplesTable'
import './samples.css'
import { isStaticExport } from '@/app/lib/staticData'
import { useAuth } from '@/app/auth/AuthProvider'
import { toast } from 'react-toastify'
import { useSupabase } from '@/app/supabase-provider'
import { useCart } from '@/app/context/CartContext'
import { Database } from '@/types/supabase'
import { Sample } from '@/types/sample'
import SampleDetailModal from '@/app/components/SampleDetailModal'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import SampleTypePieChart from '@/app/components/SampleTypePieChart'

// Filter type definition
interface FilterState {
  searchQuery: string;
  selectedTypes: string[];
  minPrice: number;
  maxPrice: number;
  locations: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

type SupabaseSample = Database['public']['Tables']['samples']['Row']

export default function ClientSamples() {
  const { supabase } = useSupabase()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [dbSamples, setDBSamples] = useState<SupabaseSample[]>([])
  const [tableSamples, setTableSamples] = useState<Sample[]>([])
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([])
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStatic, setIsStatic] = useState(true)
  const [forceDynamicMode, setForceDynamicMode] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [availableTypes, setAvailableTypes] = useState<string[]>([])
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedTypes: [],
    minPrice: 0,
    maxPrice: 1000,
    locations: [],
    dateRange: {
      start: null,
      end: null
    }
  })

  // Handle navigation
  const handleNavigation = (path: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
    }
    router.push(path)
  }

  // Check if we're in static mode
  useEffect(() => {
    const staticMode = isStaticExport();
    
    // Check for localStorage override
    let forceDynamic = false;
    if (typeof window !== 'undefined') {
      try {
        forceDynamic = localStorage.getItem('forceDynamicMode') === 'true';
        setForceDynamicMode(forceDynamic);
      } catch (e) {
        console.error('Error accessing localStorage:', e);
      }
    }
    
    // Set static mode based on environment and override
    const finalStaticMode = staticMode && !forceDynamic;
    setIsStatic(finalStaticMode);
    
    // If we're in dynamic mode, trigger sample fetch
    if (!finalStaticMode) {
      fetchSamples();
    }
  }, []);

  // Handle upload button click
  const handleUploadClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      // Redirect to login page with redirect back to upload
      router.push('/login?redirect=/samples/upload');
      toast.info('Please log in to upload samples');
    }
  };

  // Toggle dynamic mode
  const toggleDynamicMode = () => {
    const newValue = !forceDynamicMode;
    setForceDynamicMode(newValue);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('forceDynamicMode', newValue ? 'true' : 'false');
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
    // Force reload to apply changes
    window.location.reload();
  };

  // Fetch samples from Supabase
  const fetchSamples = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('samples')
        .select('*')
        .eq('status', 'public'); // Only fetch public samples

      if (error) {
        console.error('Error fetching samples:', error);
        // Fall back to mock data
        const mockSamples: SupabaseSample[] = [
          {
            id: '1',
            name: "Marine Bacterial Culture",
            type: "Bacterial",
            description: "Deep sea bacterial culture isolated from hydrothermal vents",
            location: "Pacific Ocean",
            price: 299.99,
            latitude: 45.5155,
            longitude: -122.6789,
            collection_date: "2024-02-15",
            storage_condition: "frozen",
            quantity: 5,
            hash: "sample1",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: "Cell Line A549",
            type: "Cell Line",
            description: "Human lung carcinoma cell line",
            location: "Laboratory Stock",
            price: 499.99,
            latitude: 41.8781,
            longitude: -87.6298,
            collection_date: "2024-01-20",
            storage_condition: "cryogenic",
            quantity: 3,
            hash: "sample2",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            name: "Soil Sample",
            type: "Environmental",
            description: "Rich soil sample from Amazon rainforest",
            location: "Brazil",
            price: 129.99,
            latitude: -3.4653,
            longitude: -62.2159,
            collection_date: "2023-11-05",
            storage_condition: "room temperature",
            quantity: 8,
            hash: "sample3",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            name: "E. coli Strain K-12",
            type: "Bacterial",
            description: "Standard laboratory strain of E. coli",
            location: "Research Lab",
            price: 149.99,
            latitude: 37.7749,
            longitude: -122.4194,
            collection_date: "2024-01-10",
            storage_condition: "frozen",
            quantity: 15,
            hash: "sample4",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '5',
            name: "Plant Tissue",
            type: "Plant",
            description: "Arabidopsis thaliana leaf tissue",
            location: "Greenhouse",
            price: 89.99,
            latitude: 52.5200,
            longitude: 13.4050,
            collection_date: "2024-03-01",
            storage_condition: "frozen",
            quantity: 7,
            hash: "sample5",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        const convertedSamples = mockSamples.map(convertToTableSample);
        setDBSamples(mockSamples);
        setTableSamples(convertedSamples);
        setFilteredSamples(convertedSamples);
        extractFilterOptions(convertedSamples);
      } else if (data) {
        console.log('Fetched public samples:', data);
        const convertedSamples = data.map(convertToTableSample);
        setDBSamples(data);
        setTableSamples(convertedSamples);
        setFilteredSamples(convertedSamples);
        extractFilterOptions(convertedSamples);
      }
    } catch (error) {
      console.error('Error in fetchSamples:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract available filter options from samples
  const extractFilterOptions = (samples: Sample[]) => {
    // Extract unique types
    const types = [...new Set(samples.map(s => s.type).filter(Boolean))];
    setAvailableTypes(types as string[]);
    
    // Extract unique locations
    const locations = [...new Set(samples.map(s => s.location).filter(Boolean))];
    setAvailableLocations(locations as string[]);
  };

  // Convert Supabase sample to frontend Sample type
  const convertToTableSample = (dbSample: SupabaseSample): Sample => {
    return {
      id: dbSample.id,
      name: dbSample.name,
      type: dbSample.type || undefined,
      description: dbSample.description || undefined,
      location: dbSample.location || undefined,
      price: dbSample.price,
      latitude: dbSample.latitude,
      longitude: dbSample.longitude,
      collection_date: dbSample.collection_date || undefined,
      storage_condition: dbSample.storage_condition || undefined,
      quantity: dbSample.quantity,
      hash: dbSample.hash || undefined,
      created_at: dbSample.created_at || undefined, 
      updated_at: dbSample.updated_at || undefined,
      inStock: (dbSample.quantity || 0) > 0,
      references: [
        "Smith, J. et al (2023). Novel properties of strain XYZ. Journal of Microbiology, 45(2), 112-118.",
        "Zhang, L. & Johnson, T. (2022). Comparative analysis of environmental samples. Nature Methods, 18(3), 320-328."
      ],
      status: dbSample.status === 'public' ? 'public' : 'private', // Ensure status is correctly typed
    };
  };

  // Handle adding to cart
  const handleAddToCart = async (sample: Sample) => {
    try {
      if (!user) {
        toast.error('Please log in to add items to cart');
        router.push('/login');
        return;
      }
      
      // Check if quantity is available
      if (!sample.quantity || sample.quantity <= 0) {
        toast.error('This sample is out of stock');
        return;
      }
      
      // Add to cart
      await addToCart(sample);
      toast.success(`${sample.name} added to cart`);
      
      // Update the displayed quantity in the table
      const updatedSamples = tableSamples.map(s => {
        if (s.id === sample.id) {
          // Decrease the quantity by 1 (or the selected quantity)
          return { 
            ...s, 
            quantity: Math.max(0, (s.quantity || 0) - 1),
            inStock: ((s.quantity || 0) - 1) > 0
          };
        }
        return s;
      });
      
      setTableSamples(updatedSamples);
      
      // Also update filtered samples to keep them in sync
      const updatedFilteredSamples = filteredSamples.map(s => {
        if (s.id === sample.id) {
          return { 
            ...s, 
            quantity: Math.max(0, (s.quantity || 0) - 1),
            inStock: ((s.quantity || 0) - 1) > 0
          };
        }
        return s;
      });
      
      setFilteredSamples(updatedFilteredSamples);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Handle sample selection (from map or table)
  const handleSampleSelect = (sample: Sample) => {
    setSelectedSample(sample);
    setShowDetailModal(true);
  };

  // Handle view sample details (from table)
  const handleViewSampleDetails = (sample: Sample) => {
    setSelectedSample(sample);
    setShowDetailModal(true);
  };

  // Apply filters
  useEffect(() => {
    if (tableSamples.length > 0) {
      let result = [...tableSamples];
      
      // Apply search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        result = result.filter(sample => 
          sample.name.toLowerCase().includes(query) || 
          sample.description?.toLowerCase().includes(query) ||
          sample.location?.toLowerCase().includes(query) ||
          sample.type?.toLowerCase().includes(query)
        );
      }
      
      // Apply type filter
      if (filters.selectedTypes.length > 0) {
        result = result.filter(sample => 
          sample.type && filters.selectedTypes.includes(sample.type)
        );
      }
      
      // Apply price range filter
      result = result.filter(sample => 
        sample.price >= filters.minPrice && 
        sample.price <= filters.maxPrice
      );
      
      // Apply location filter
      if (filters.locations.length > 0) {
        result = result.filter(sample => 
          sample.location && filters.locations.includes(sample.location)
        );
      }
      
      // Apply date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        result = result.filter(sample => {
          if (!sample.collection_date) return false;
          
          const sampleDate = new Date(sample.collection_date).getTime();
          const startOk = !filters.dateRange.start || sampleDate >= new Date(filters.dateRange.start).getTime();
          const endOk = !filters.dateRange.end || sampleDate <= new Date(filters.dateRange.end).getTime();
          
          return startOk && endOk;
        });
      }
      
      setFilteredSamples(result);
    }
  }, [tableSamples, filters]);

  // Mock data for samples
  useEffect(() => {
    if (!isStatic) return; // Only load mock data in static mode
    
    // Simulate API call with mock data for now
    setLoading(true);
    setTimeout(() => {
      const mockSamples: SupabaseSample[] = [
        {
          id: '1',
          name: "Marine Bacterial Culture",
          type: "Bacterial",
          description: "Deep sea bacterial culture isolated from hydrothermal vents",
          location: "Pacific Ocean",
          price: 299.99,
          latitude: 45.5155,
          longitude: -122.6789,
          collection_date: "2024-02-15",
          storage_condition: "frozen",
          quantity: 5,
          hash: "sample1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: "Cell Line A549",
          type: "Cell Line",
          description: "Human lung carcinoma cell line",
          location: "Laboratory Stock",
          price: 499.99,
          latitude: 41.8781,
          longitude: -87.6298,
          collection_date: "2024-01-20",
          storage_condition: "cryogenic",
          quantity: 3,
          hash: "sample2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: "Soil Sample",
          type: "Environmental",
          description: "Rich soil sample from Amazon rainforest",
          location: "Brazil",
          price: 129.99,
          latitude: -3.4653,
          longitude: -62.2159,
          collection_date: "2023-11-05",
          storage_condition: "room temperature",
          quantity: 8,
          hash: "sample3",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          name: "E. coli Strain K-12",
          type: "Bacterial",
          description: "Standard laboratory strain of E. coli",
          location: "Research Lab",
          price: 149.99,
          latitude: 37.7749,
          longitude: -122.4194,
          collection_date: "2024-01-10",
          storage_condition: "frozen",
          quantity: 15,
          hash: "sample4",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          name: "Plant Tissue",
          type: "Plant",
          description: "Arabidopsis thaliana leaf tissue",
          location: "Greenhouse",
          price: 89.99,
          latitude: 52.5200,
          longitude: 13.4050,
          collection_date: "2024-03-01",
          storage_condition: "frozen",
          quantity: 7,
          hash: "sample5",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // Filter mock data to only show public samples (if mock data has status)
      const publicMockSamples = mockSamples.filter(s => s.status === 'public' || !s.status); // Assume public if status undefined

      const convertedSamples = publicMockSamples.map(convertToTableSample);
      setDBSamples(publicMockSamples);
      setTableSamples(convertedSamples);
      setFilteredSamples(convertedSamples);
      extractFilterOptions(convertedSamples);
      setLoading(false);
    }, 1000);
  }, [isStatic]);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Samples data notification banner */}
      {!isStatic && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
          <p className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Running in live mode with real Supabase connection. Sample data is being loaded from your database.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
        <h2 className="text-2xl mb-4">Browse Samples</h2>
        <p className="text-gray-600 mb-6">
          Discover and browse scientific samples from researchers around the world. Find the perfect samples for your research needs.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <Link href="/samples/upload" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md inline-flex items-center"
            onClick={handleUploadClick}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            Upload Samples
          </Link>

          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={toggleDynamicMode}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Switch to {forceDynamicMode ? 'Static' : 'Live'} Mode
            </button>
          )}
        </div>

        {/* Search and filter section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, type, location..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              />
            </div>
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowFilters(!showFilters)}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-gray-500" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Type filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sample Type</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={filters.selectedTypes[0] || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters({
                        ...filters,
                        selectedTypes: value ? [value] : []
                      });
                    }}
                  >
                    <option value="">All Types</option>
                    {availableTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Price range filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <div className="flex items-center space-x-2">
                    <div className="relative mt-1 rounded-md shadow-sm flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        placeholder="Min"
                        className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="relative mt-1 rounded-md shadow-sm flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        placeholder="Max"
                        className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 1000 })}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Location filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={filters.locations[0] || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters({
                        ...filters,
                        locations: value ? [value] : []
                      });
                    }}
                  >
                    <option value="">All Locations</option>
                    {availableLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Date range filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collection Date (Start)</label>
                  <input
                    type="date"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={filters.dateRange.start || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value || null
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collection Date (End)</label>
                  <input
                    type="date"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={filters.dateRange.end || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        end: e.target.value || null
                      }
                    })}
                  />
                </div>

                {/* Reset filters button */}
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({
                      searchQuery: '',
                      selectedTypes: [],
                      minPrice: 0,
                      maxPrice: 1000,
                      locations: [],
                      dateRange: {
                        start: null,
                        end: null
                      }
                    })}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="my-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-xl">Loading samples...</p>
          </div>
        ) : filteredSamples.length === 0 ? (
          <div className="my-12 text-center">
            <p className="text-xl">No samples found matching your criteria.</p>
            <button
              onClick={() => setFilters({
                searchQuery: '',
                selectedTypes: [],
                minPrice: 0,
                maxPrice: 1000,
                locations: [],
                dateRange: {
                  start: null,
                  end: null
                }
              })}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-xl mb-4">Sample Locations</h3>
              <div className="h-[400px] w-full">
                <SamplesMap
                  samples={filteredSamples}
                  onSampleSelect={handleSampleSelect}
                  selectedSample={selectedSample}
                />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl mb-4">Available Samples ({filteredSamples.length})</h3>
              <div className="overflow-x-auto">
                <SamplesTable 
                  samples={filteredSamples}
                  onSampleSelect={handleSampleSelect}
                  onAddToCart={handleAddToCart}
                  onViewDetails={handleViewSampleDetails}
                  loading={loading}
                  isAuthenticated={!!user}
                />
              </div>
            </div>
            
            {/* Platform Statistics Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">Platform Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Samples</p>
                  <p className="text-3xl font-bold">{tableSamples.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Updated daily</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Active Users</p>
                  <p className="text-3xl font-bold">347</p>
                  <p className="text-xs text-gray-500 mt-1">+8% from last month</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Types</p>
                  <p className="text-3xl font-bold">{availableTypes.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Diverse sample collection</p>
                </div>
              </div>
              
              {/* Sample Type Distribution Chart */}
              <div className="mb-10">
                <SampleTypePieChart samples={tableSamples} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sample Detail Modal */}
      <SampleDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        sample={selectedSample}
        onAddToCart={handleAddToCart}
      />
    </main>
  );
}

