import { Suspense } from 'react'
import SampleViewEditClient from './SampleViewEditClient'

// Enable dynamic rendering for all sample IDs that aren't statically generated
export const dynamicParams = true;

// Generate a few static paths for common samples
export function generateStaticParams() {
  return [
    { id: 'placeholder' }
  ]
}

export const metadata = {
  title: 'Sample Details - Sample Exchange',
  description: 'View detailed information about this scientific sample',
}

export default function SampleDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="loading-spinner">Loading sample details...</div>}>
        <SampleViewEditClient id={params.id} />
      </Suspense>
    </div>
  )
}
