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
      <main>
        <section className="samples-page">
          <div className="samples-hero">
            <h1>Browse Samples</h1>
            <p>Loading samples...</p>
          </div>
          <div className="loading-spinner"></div>
        </section>
      </main>
    }>
      <ClientPage />
    </Suspense>
  )
}
