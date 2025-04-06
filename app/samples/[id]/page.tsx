import { Suspense } from 'react'
import SampleDetailClient from './SampleDetailClient'

// This function is required for static export with dynamic routes
export function generateStaticParams() {
  // Generate a list of possible IDs for static generation
  return [
    { id: 'sample-001' },
    { id: 'sample-002' },
    { id: 'sample-003' },
    { id: 'sample-004' },
    { id: 'sample-005' },
    { id: 'sample-006' }
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
        <SampleDetailClient id={params.id} />
      </Suspense>
    </div>
  )
}
