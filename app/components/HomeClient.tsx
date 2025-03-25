'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function HomeClient() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Force video reload
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [])

  // Function to handle navigation
  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <main>
      <section className="hero">
        <div className="video-background">
          <video ref={videoRef} autoPlay muted loop playsInline>
            <source src="/assets/videos/lab-background.mp4" type="video/mp4" />
          </video>
          <div className="overlay"></div>
        </div>
        
        <div className="geometric-shape circle"></div>
        <div className="geometric-shape triangle"></div>
        
        <div className="hero-container">
          <div className="hero-content">
            <p className="accent-text">INNOVATIVE BIOLOGICAL SAMPLE EXCHANGE</p>
            <h1>Accelerating Scientific Discovery</h1>
            <div className="hero-text">
              <p>Connect with researchers worldwide to exchange high-quality biological samples. Our platform streamlines the process of finding, purchasing, and shipping samples for your research needs.</p>
            </div>
            <div className="hero-actions">
              <Link href="/samples" className="btn btn-primary">Browse Samples</Link>
              <Link href="/about" className="btn btn-secondary">Learn More</Link>
            </div>
          </div>
        </div>
      </section>
      
      <section className="features" id="overview">
        <div className="container">
          <h2 className="section-heading">Why Choose Sample Exchange?</h2>
          
          <div className="feature-grid">
            <div className="feature">
              <h3>Verified Quality</h3>
              <p>All samples undergo rigorous quality control before listing. Detailed documentation ensures you know exactly what you're receiving.</p>
            </div>
            
            <div className="feature">
              <h3>Global Network</h3>
              <p>Access samples from research institutions worldwide. Our platform connects you with diverse biological materials previously difficult to obtain.</p>
            </div>
            
            <div className="feature">
              <h3>Secure Transactions</h3>
              <p>Our platform ensures safe payment processing and proper handling of regulatory compliance for international shipping.</p>
            </div>
            
            <div className="feature">
              <h3>Easy Uploads</h3>
              <p>Researchers can easily list their available samples, setting competitive prices and handling all transactions through our streamlined system.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="testimonials" id="testimonials">
        <div className="container">
          <h2 className="section-heading">What Researchers Are Saying</h2>
          
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <p>"Sample Exchange transformed how we source rare tissue samples. What used to take months of networking now happens in days."</p>
              <cite>Dr. Emily Chen, Stanford University</cite>
            </div>
            
            <div className="testimonial-card">
              <p>"The quality control is outstanding. Every sample we've received has met or exceeded the specifications listed."</p>
              <cite>Dr. Michael Rodriguez, NIH</cite>
            </div>
            
            <div className="testimonial-card">
              <p>"As a small lab, we've been able to monetize our excess samples, creating a valuable revenue stream while helping other researchers."</p>
              <cite>Dr. Sarah Johnson, University of Washington</cite>
            </div>
          </div>
        </div>
      </section>
      
      <section className="contact-section" id="contact">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p className="section-subtitle">Join our growing community of researchers sharing biological samples worldwide</p>
          
          <div className="contact-container">
            <div className="contact-form-container compact">
              <div className="contact-form compact-form">
                <div className="form-actions">
                  <Link href="/register" className="btn btn-primary">Create an Account</Link>
                  <Link href="/samples" className="btn btn-secondary">Browse Samples</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 