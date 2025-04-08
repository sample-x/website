import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Use dynamic import with no SSR to avoid window reference errors during static generation
const ClientSamplesComponent = dynamic(() => import('./ClientSamples'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-xl">Loading samples...</p>
      </div>
    </div>
  ),
});

export default function SamplesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-xl">Loading samples...</p>
        </div>
      </div>
    }>
      <ClientSamplesComponent />
    </Suspense>
  );
}
