'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../context/SupabaseProvider';

type Sample = {
  id: number;
  name: string;
  type: string;
  host: string;
  location: string;
  latitude?: number;
  longitude?: number;
  collectionDate?: string;
  storageCondition?: string;
  availability?: string;
  contact?: string;
  description?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  created_at?: string;
  updated_at?: string;
};

type SampleFilter = {
  type?: string;
  location?: string;
  search?: string;
};

export function useSamples() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  // Function to load samples from API if Supabase is not available
  const loadSamplesFromApi = useCallback(async (filters: SampleFilter = {}) => {
    try {
      // Build URL with query parameters for filtering
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10001'}/api/samples`;
      
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.location) params.append('location', filters.location);
      if (filters.search) params.append('search', filters.search);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading samples from API:', error);
      throw error;
    }
  }, []);

  // Function to load samples from Supabase or API fallback
  const loadSamples = useCallback(async (filters: SampleFilter = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let data;
      
      // Try Supabase first if available
      if (supabase) {
        try {
          let query = supabase.from('samples').select('*');
          
          // Apply filters
          if (filters.type) {
            query = query.eq('type', filters.type);
          }
          
          if (filters.location) {
            query = query.eq('location', filters.location);
          }
          
          if (filters.search) {
            const searchTerm = `%${filters.search}%`;
            // Search in name and description
            query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
          }
          
          const { data: supabaseData, error } = await query;
          
          if (error) {
            console.warn('Supabase query error, falling back to API:', error);
          } else {
            data = supabaseData;
          }
        } catch (supabaseError) {
          console.warn('Supabase error, falling back to API:', supabaseError);
        }
      }
      
      // If Supabase failed or is not available, use API
      if (!data) {
        console.log('Using API fallback for samples');
        data = await loadSamplesFromApi(filters);
      }
      
      // Update state with fetched data
      setSamples(data);
      setFilteredSamples(data);
    } catch (error) {
      console.error('Error loading samples:', error);
      setError('Failed to load samples. Please try again later.');
      // Set empty arrays to avoid undefined errors
      setSamples([]);
      setFilteredSamples([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, loadSamplesFromApi]);

  // Function to get unique types from samples
  const getSampleTypes = useCallback(() => {
    const types = [...new Set(samples.map(sample => sample.type))];
    return types;
  }, [samples]);

  // Function to get unique locations from samples
  const getSampleLocations = useCallback(() => {
    const locations = [...new Set(samples.map(sample => sample.location))];
    return locations;
  }, [samples]);

  // Initialize by loading all samples
  useEffect(() => {
    loadSamples();
  }, [loadSamples]);

  // Function to apply client-side filtering
  const filterSamples = useCallback((filters: SampleFilter) => {
    let filtered = [...samples];
    
    if (filters.type) {
      filtered = filtered.filter(sample => sample.type === filters.type);
    }
    
    if (filters.location) {
      filtered = filtered.filter(sample => sample.location === filters.location);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(sample =>
        sample.name.toLowerCase().includes(searchTerm) ||
        (sample.description && sample.description.toLowerCase().includes(searchTerm))
      );
    }
    
    setFilteredSamples(filtered);
  }, [samples]);

  // Get a sample by ID
  const getSampleById = useCallback(async (id: number | string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First check if we already have it in state
      const cachedSample = samples.find(s => s.id.toString() === id.toString());
      if (cachedSample) {
        setIsLoading(false);
        return cachedSample;
      }
      
      // Try fetching from Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('samples')
          .select('*')
          .eq('id', id)
          .single();
          
        if (!error && data) {
          return data;
        }
      }
      
      // Fallback to API
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10001'}/api/samples/${id}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const sample = await response.json();
      return sample;
    } catch (error) {
      console.error(`Error fetching sample with ID ${id}:`, error);
      setError(`Failed to load sample with ID ${id}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [samples, supabase]);

  return {
    samples: filteredSamples,
    isLoading,
    error,
    loadSamples,
    filterSamples,
    getSampleById,
    getSampleTypes,
    getSampleLocations
  };
} 