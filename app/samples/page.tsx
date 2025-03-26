import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
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

export const revalidate = 0;

export default async function SamplesPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: samples } = await supabase
    .from('samples')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sample Map</h1>
      <div className="bg-white rounded-lg shadow-lg p-4">
        <SamplesMapContainer samples={samples as Sample[]} />
      </div>
    </main>
  );
}
