'use client';

import { useState, useEffect } from 'react';
import { Sample } from '@/types/sample';
import SampleMap from './SampleMap';
import { useSupabase } from '@/app/supabase-provider';
import { toast } from 'react-toastify';
import type { LatLngBounds } from 'leaflet';

interface SamplesMapContainerProps {
  samples: Sample[];
  onSampleSelect?: (sample: Sample) => void;
}

declare global {
  interface WindowEventMap {
    showSampleInfo: CustomEvent<number>;
    addToCart: CustomEvent<number>;
  }
}

const SamplesMapContainer: React.FC<SamplesMapContainerProps> = ({
  samples,
  onSampleSelect,
}) => {
  const { supabase } = useSupabase();
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [visibleSamples, setVisibleSamples] = useState<Sample[]>(samples);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for custom events from the map
    const handleShowSampleInfo = (event: CustomEvent<number>) => {
      const sample = samples.find(s => s.id === event.detail);
      if (sample && onSampleSelect) {
        onSampleSelect(sample);
      }
      setSelectedSample(sample || null);
    };

    const handleAddToCart = async (event: CustomEvent<number>) => {
      const sample = samples.find(s => s.id === event.detail);
      if (!sample) return;

      try {
        const { data: cart, error: cartError } = await supabase
          .from('cart')
          .select('*')
          .eq('sample_id', sample.id)
          .single();

        if (cartError && cartError.code !== 'PGRST116') {
          throw cartError;
        }

        if (cart) {
          // Update quantity if already in cart
          const { error: updateError } = await supabase
            .from('cart')
            .update({ quantity: cart.quantity + 1 })
            .eq('sample_id', sample.id);

          if (updateError) throw updateError;
        } else {
          // Add new item to cart
          const { error: insertError } = await supabase
            .from('cart')
            .insert([{ sample_id: sample.id, quantity: 1 }]);

          if (insertError) throw insertError;
        }

        toast.success(`Added ${sample.name} to cart`);
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add item to cart');
      }
    };

    // Only attach event listeners if we're in the browser
    if (typeof window !== 'undefined') {
      window.addEventListener('showSampleInfo', handleShowSampleInfo);
      window.addEventListener('addToCart', handleAddToCart);

      return () => {
        window.removeEventListener('showSampleInfo', handleShowSampleInfo);
        window.removeEventListener('addToCart', handleAddToCart);
      };
    }
  }, [samples, onSampleSelect, supabase]);

  const handleBoundsChange = (bounds: LatLngBounds) => {
    try {
      const visible = samples.filter(sample => 
        sample.latitude && 
        sample.longitude && 
        bounds.contains([sample.latitude, sample.longitude])
      );
      setVisibleSamples(visible);
    } catch (error) {
      console.error('Error handling map bounds change:', error);
      setMapError('Error displaying samples on map');
    }
  };

  // Filter out samples without coordinates
  const samplesWithCoordinates = samples.filter(
    sample => sample.latitude && sample.longitude
  );

  if (mapError) {
    return (
      <div className="map-error p-4 bg-red-50 text-red-700 rounded">
        <p>{mapError}</p>
        <p>Please check browser console for details.</p>
      </div>
    );
  }

  // Add log here
  console.log(`[SamplesMapContainer Debug] Passing ${samplesWithCoordinates.length} samples with coordinates to SampleMap.`);

  return (
    <div className="relative w-full h-[400px]">
      {samplesWithCoordinates.length > 0 ? (
        <SampleMap
          samples={samplesWithCoordinates}
          center={[20, 0]}
          zoom={2}
          interactive={true}
          onBoundsChange={handleBoundsChange}
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded">
          <p className="text-gray-500">No samples with location data available.</p>
        </div>
      )}
      {/* Optional: Add a legend or other map controls here */}
    </div>
  );
};

export default SamplesMapContainer; 