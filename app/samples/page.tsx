import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import './samples.css'

// Dynamically import the client component with no SSR
const ClientPage = dynamic(
  () => import('./ClientPage'),
  { ssr: false }
)

export const metadata = {
  title: 'Browse Samples - Sample Exchange',
  description: 'Discover and browse scientific samples from researchers around the world.',
}

export default function SamplesPage() {
  return (
    <Suspense fallback={
      <main className="samples-page">
        <div className="container">
          <div className="page-header">
            <h1>Browse Samples</h1>
            <p>Discover and browse scientific samples from researchers around the world.</p>
          </div>
          
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading samples...</p>
          </div>
        </div>
      </main>
    }>
      <ClientPage />
    </Suspense>
  )
}
