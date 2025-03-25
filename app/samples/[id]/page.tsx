import { Suspense } from 'react'
import Link from 'next/link'

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
    <div className="sample-detail-page">
      <div className="page-header">
        <h1>Sample Details</h1>
      </div>
      
      <div className="sample-detail-container">
        <Suspense fallback={<div>Loading sample details...</div>}>
          <div className="sample-detail">
            <p>This is a placeholder detail page for sample ID: {params.id}</p>
            <p>In a production environment, this would contain detailed information about the sample.</p>
            <div className="actions">
              <Link href="/samples" className="btn btn-secondary">Back to Samples</Link>
              <Link href={`/checkout/${params.id}`} className="btn btn-primary">Purchase Sample</Link>
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  )
}
