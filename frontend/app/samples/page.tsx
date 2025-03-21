// Make this a server component
export default function SamplesPage() {
  return (
    <main>
      <h1>Sample Exchange</h1>
      <p>Browse our collection of high-quality samples</p>
      
      {/* Client component loaded with dynamic import */}
      <div className="samples-content">
        <ClientSamples />
      </div>
    </main>
  );
}

// Use dynamic import with ssr:false to prevent server-side rendering
import dynamic from 'next/dynamic';

const ClientSamples = dynamic(
  () => import('./ClientSamples'),
  { ssr: false } // This is crucial - it prevents the component from rendering on the server
); 