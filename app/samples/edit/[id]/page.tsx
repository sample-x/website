import EditSampleClient from './EditSampleClient';

// Enable dynamic rendering for all sample IDs that aren't statically generated
export const dynamicParams = true;

// Server component 
export default function EditSamplePage({ params }: { params: { id: string } }) {
  return <EditSampleClient id={params.id} />;
}

// Add generateStaticParams for static export
export function generateStaticParams() {
  // For static export, we'll just return a dummy ID
  // The real fetching happens client-side
  return [{ id: 'placeholder' }];
} 