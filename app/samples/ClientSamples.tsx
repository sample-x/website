'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import SamplesMap from '@/app/samples/SamplesMap'
import { SamplesMapProps } from '@/app/samples/mapTypes'
import SamplesTable from './SamplesTable'
import './samples.css'
import { isStaticExport } from '@/app/lib/staticData'
import { useAuth } from '@/app/auth/AuthProvider'
import { toast } from 'react-toastify'
import { useCart } from '@/app/context/CartContext'
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

// Define initial empty filter state
const initialFilterState: FilterState = {
  searchQuery: '',
  selectedTypes: [],
  minPrice: 0,
  maxPrice: 1000, // Or determine dynamically later
  locations: [],
  dateRange: {
    start: null,
    end: null
  }
};

export default function ClientSamples() {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // State Initialization
  const [tableSamples, setTableSamples] = useState<Sample[]>([])
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([])
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [loading, setLoading] = useState(true) // Start loading initially
  const [error, setError] = useState<string | null>(null) // State for error messages
  const [isStaticMode, setIsStaticMode] = useState<boolean | null>(null); // Initial state unknown
  const [showLoginModal, setShowLoginModal] = useState(false) // Keep this if needed for login flow
  const [showFilters, setShowFilters] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [availableTypes, setAvailableTypes] = useState<string[]>([])
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // --- Mode Detection ---
  useEffect(() => {
    console.log('[ClientSamples] Determining mode...');
    const staticModeDetected = isStaticExport();
    setIsStaticMode(staticModeDetected);
    console.log(`[ClientSamples] Mode determined: ${staticModeDetected ? 'STATIC' : 'DYNAMIC'}`);

    // If dynamic mode, immediately trigger fetch
    if (!staticModeDetected) {
        console.log('[ClientSamples] Dynamic mode detected, initiating API fetch call...');
        fetchSamplesViaApi(); // Call the async function
    } else {
        console.log('[ClientSamples] Static mode detected, skipping dynamic fetch.');
        setLoading(false);
    }
  }, []); // Run only once on mount

  // Handle navigation
  const handleNavigation = (path: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
    }
    router.push(path)
  }

  // Handle upload button click
  const handleUploadClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      // Redirect to login page with redirect back to upload
      router.push('/login?redirect=/samples/upload');
      toast.info('Please log in to upload samples');
    }
  };

  // --- Data Fetching via Cloudflare Function API ---
  const fetchSamplesViaApi = useCallback(async () => {
    console.log(`[ClientSamples] fetchSamplesViaApi called. Current isStaticMode: ${isStaticMode}`);
    
    // Ensure we only fetch if in dynamic mode
    if (isStaticMode !== false) { 
      console.log('[ClientSamples] fetchSamplesViaApi aborted (condition isStaticMode !== false is TRUE).');
      setLoading(false); 
      return;
    }
    console.log('[ClientSamples] fetchSamplesViaApi proceeding (condition isStaticMode !== false is FALSE).');

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      console.log('[ClientSamples] >>>>> ATTEMPTING TO FETCH from API endpoint /api/get-samples...'); // Added specific log
      const response = await fetch('/api/get-samples');
      console.log('[ClientSamples] <<<<< FETCH call completed.'); // Added specific log

      if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}`;
        try {
            const errorBody = await response.json();
            errorMsg = errorBody.error || errorMsg;
        } catch (e) { /* Ignore parsing error */ }
        console.error(`[ClientSamples] Error fetching from /api/get-samples: ${errorMsg}`);
        toast.error(`Failed to load samples: ${errorMsg}`);
        setError('Failed to load samples from the server.');
        setTableSamples([]);
        setFilteredSamples([]);
        return; // Exit on error
      }

      const data: Sample[] = await response.json(); // Assuming API returns data in Sample format directly

      if (data) {
        console.log(`[ClientSamples] Successfully fetched ${data.length} samples via API.`);
        console.log('[ClientSamples] Setting Table and Filtered samples state from API data.');
        setTableSamples(data); // Use API data directly
        setFilteredSamples(data); // Initialize filtered with all fetched samples
        extractFilterOptions(data);
      } else {
          console.warn('[ClientSamples] API returned null or undefined data.');
          setTableSamples([]);
          setFilteredSamples([]);
      }

    } catch (catchError: any) { // Catch network errors from fetch itself
      console.error('[ClientSamples] Network or other unexpected error in fetchSamplesViaApi:', catchError);
      // Check if it's the profile fetch error (though ideally handled elsewhere)
      if (catchError?.message?.includes('fetch user profile')) {
          console.warn('[ClientSamples] Profile fetch error caught during sample fetch, ignoring for now.')
      } else {
          toast.error('A network error occurred while loading samples.');
          setError(`Network Error: ${catchError.message}`); 
          setTableSamples([]);
          setFilteredSamples([]);
      }
    } finally {
      console.log('[ClientSamples] fetchSamplesViaApi finished.');
      setLoading(false); // Ensure loading is set to false
    }
  }, [isStaticMode]); // Depend only on mode

  // Extract available filter options from samples
  const extractFilterOptions = (samples: Sample[]) => {
    // Extract unique types
    const types = [...new Set(samples.map(s => s.type).filter(Boolean))];
    setAvailableTypes(types as string[]);
    
    // Extract unique locations
    const locations = [...new Set(samples.map(s => s.location).filter(Boolean))];
    setAvailableLocations(locations as string[]);
    console.log(`[ClientSamples] Extracted filter options: ${types.length} types, ${locations.length} locations.`);
  };

  // Convert Supabase sample to frontend Sample type
  const convertToTableSample = (dbSample: any): Sample => {
    return {
      id: dbSample.id,
      name: dbSample.name ?? 'Unnamed Sample', // Provide default
      type: dbSample.type ?? undefined,
      description: dbSample.description ?? undefined,
      location: dbSample.location ?? undefined,
      price: dbSample.price ?? 0, // Provide default
      latitude: dbSample.latitude ?? undefined, // Convert null to undefined
      longitude: dbSample.longitude ?? undefined, // Convert null to undefined
      collection_date: dbSample.collection_date || undefined,
      storage_condition: dbSample.storage_condition || undefined,
      quantity: dbSample.quantity ?? 0, // Provide default
      created_at: dbSample.created_at || undefined,
      updated_at: dbSample.updated_at || undefined,
      // Calculate inStock based on quantity, handling null/undefined
      inStock: (dbSample.quantity ?? 0) > 0,
      references: [ // Keep mock references for now, replace if dynamic needed
        "Smith, J. et al (2023). Novel properties of strain XYZ. Journal of Microbiology, 45(2), 112-118.",
        "Zhang, L. & Johnson, T. (2022). Comparative analysis of environmental samples. Nature Methods, 18(3), 320-328."
      ]
    };
  };

  // Handle adding to cart
  const handleAddToCart = useCallback(async (sample: Sample) => {
    console.log(`[ClientSamples] Attempting to add sample ID ${sample.id} to cart.`);
    try {
      if (!user) {
        toast.error('Please log in to add items to cart');
        router.push('/login');
        return;
      }

      if (!sample.quantity || sample.quantity <= 0) {
        toast.error('This sample is out of stock');
        return;
      }

      await addToCart(sample);
      toast.success(`${sample.name} added to cart`);

      // Update state locally to reflect quantity decrease
      const updateSampleState = (prevState: Sample[]) =>
        prevState.map(s =>
          s.id === sample.id
            ? {
                ...s,
                quantity: Math.max(0, (s.quantity || 0) - 1),
                inStock: (s.quantity || 0) - 1 > 0
              }
            : s
        );

      console.log(`[ClientSamples] Updating tableSamples state after adding sample ${sample.id} to cart.`);
      setTableSamples(updateSampleState);

      console.log(`[ClientSamples] Updating filteredSamples state after adding sample ${sample.id} to cart.`);
      setFilteredSamples(updateSampleState);

    } catch (error) {
      console.error('[ClientSamples] Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  }, [user, addToCart, router]); // Add dependencies

  // Handle sample selection (from map or table)
  const handleSampleSelect = useCallback((sample: Sample) => {
    console.log(`[ClientSamples] Selected sample ID ${sample.id} from map/table.`);
    setSelectedSample(sample);
    setShowDetailModal(true);
  }, []); // No dependencies needed

  // Handle view sample details (from table) - can likely reuse handleSampleSelect
  const handleViewSampleDetails = handleSampleSelect;

  // Apply filters
  useEffect(() => {
    if (tableSamples.length > 0 && isStaticMode === false) {
        console.log('[ClientSamples] Applying filters to tableSamples:', filters);
        let result = [...tableSamples];

        // Apply search query
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          result = result.filter(sample =>
            sample.name.toLowerCase().includes(query) ||
            (sample.description && sample.description.toLowerCase().includes(query)) ||
            (sample.location && sample.location.toLowerCase().includes(query)) ||
            (sample.type && sample.type.toLowerCase().includes(query))
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
          (sample.price ?? 0) >= filters.minPrice && // Handle potential null price
          (sample.price ?? 0) <= filters.maxPrice
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
            try {
                const sampleDate = new Date(sample.collection_date).getTime();
                // Check if dates are valid before comparing
                const startDate = filters.dateRange.start ? new Date(filters.dateRange.start).getTime() : null;
                const endDate = filters.dateRange.end ? new Date(filters.dateRange.end).getTime() : null;

                if ((startDate && isNaN(startDate)) || (endDate && isNaN(endDate))) {
                    console.warn('[ClientSamples] Invalid date provided for filtering.');
                    return true; // Don't filter out if date is invalid, or handle differently
                }

                const startOk = !startDate || sampleDate >= startDate;
                const endOk = !endDate || sampleDate <= endDate;
                return startOk && endOk;
            } catch (dateError) {
                console.error('[ClientSamples] Error parsing date during filtering:', dateError);
                return false; // Exclude if date parsing fails
            }
          });
        }

        console.log(`[ClientSamples] Filtering complete. ${result.length} samples remaining.`);
        setFilteredSamples(result);
    } else if (isStaticMode === false) {
        // If dynamic mode but no table samples (e.g., after error), ensure filtered is also empty
        console.log('[ClientSamples] No tableSamples to filter, ensuring filteredSamples is empty.');
        setFilteredSamples([]);
    }
    // If isStaticMode is true, filteredSamples should have been set during initialization or remain empty
  }, [tableSamples, filters, isStaticMode]); // Add isStaticMode dependency

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Status Banner */}
      {isStaticMode === true && ( // Show only if definitively static
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-6">
          <p className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">/* Add appropriate icon */</svg>
            Running in static mode. Displaying default data. Network features are disabled.
          </p>
        </div>
      )}
      {isStaticMode === false && !loading && !error && ( // Show only if dynamic, loaded, no error
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
           <p className="flex items-center">
             <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
             </svg>
             Running in live mode with real Supabase connection.
           </p>
        </div>
      )}
      {error && ( // Show error banner if error state is set
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">/* Add error icon */</svg>
            Error: {error}
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
            className={`bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md inline-flex items-center ${isStaticMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={(e) => {
              if (isStaticMode) {
                e.preventDefault();
                toast.info('Uploading samples is disabled in static mode.');
                return;
              }
              handleUploadClick(e);
            }}
            aria-disabled={isStaticMode === true}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            Upload Samples
          </Link>
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

        {/* --- Content Display --- */}
        {loading && isStaticMode === null && ( // Show initial loading only before mode is determined
            <div className="my-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
                <p className="text-xl">Initializing...</p>
            </div>
        )}
        {loading && isStaticMode === false && ( // Show loading specifically for dynamic data fetch
            <div className="my-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
                <p className="text-xl">Loading samples from database...</p>
            </div>
        )}
         {!loading && !error && filteredSamples.length === 0 && isStaticMode === false && ( // Dynamic mode, loaded, no error, no results
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
        )}
        {!loading && !error && filteredSamples.length > 0 && ( // Dynamic mode, loaded, no error, show results
          <>
            {/* Map */}
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

            {/* Table */}
            <div className="mb-8">
              <h3 className="text-xl mb-4">Available Samples ({filteredSamples.length})</h3>
              <div className="overflow-x-auto">
                <SamplesTable
                  samples={filteredSamples}
                  onSampleSelect={handleSampleSelect}
                  onAddToCart={handleAddToCart}
                  onViewDetails={handleViewSampleDetails}
                  loading={false}
                  isAuthenticated={!!user}
                  isStaticMode={isStaticMode ?? false}
                />
              </div>
            </div>

            {/* Statistics */}
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
              
              <div className="mb-10">
                <SampleTypePieChart samples={isStaticMode ? [] : tableSamples} />
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
        isStaticMode={isStaticMode ?? false}
      />
    </main>
  );
}

