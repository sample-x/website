'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import { Sample } from '@/types/sample';
import dynamic from 'next/dynamic';
import './samples.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCartPlus, faFlask, faFileAlt, faUpload } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const SamplesMapContainer = dynamic(
  () => import('@/components/SamplesMapContainer'),
  { ssr: false }
);

export default function SamplesPage() {
  const { supabase } = useSupabase();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSamples() {
      try {
        const { data, error } = await supabase
          .from('samples')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSamples(data || []);
      } catch (error) {
        console.error('Error fetching samples:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSamples();
  }, [supabase]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Sample Map</h1>
        <div className="bg-white rounded-lg shadow-lg p-4">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sample Map</h1>
      <div className="bg-white rounded-lg shadow-lg p-4">
        <SamplesMapContainer samples={samples} />
      </div>
    </main>
  );
}
