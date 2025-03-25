import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Import the CSS statically
import './team.css'

// Dynamically import the client component with no SSR
const TeamPageClient = dynamic(
  () => import('./TeamPageClient'),
  { ssr: false }
)

export const metadata = {
  title: 'Our Team - Sample Exchange',
  description: 'Meet the visionaries behind Sample Exchange, dedicated to revolutionizing scientific collaboration and resource sharing',
}

export default function TeamPage() {
  return (
    <Suspense fallback={
      <main>
        <section className="team-page">
          <div className="team-hero">
            <h1>Our Team</h1>
            <p>Loading team information...</p>
          </div>
          <div className="loading-spinner"></div>
        </section>
      </main>
    }>
      <TeamPageClient />
    </Suspense>
  )
}
