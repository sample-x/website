'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import ContactForm from './components/ContactForm'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Force video reload
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [])

  return (
    <main>
      <section className="hero" id="top">
        <div className="video-background">
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            loop 
            playsInline
            key="hero-video"
          >
            <source src="/assets/videos/start.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="overlay"></div>
        </div>
        <div className="geometric-shape circle"></div>
        <div className="geometric-shape triangle"></div>
        <div className="hero-container">
          <div className="hero-content">
            <p className="accent-text">Redefining Scientific Exchange</p>
            <h1>The world's first marketplace for science</h1>
            <div className="hero-text">
              <p>Individual researchers, organizations and companies can share, monetize and out-license research assets which would otherwise remain locked up in storage and freezers.</p>
              <p>Sharing preliminary and intermediate products, hard-to-obtain samples, and difficult-to-produce libraries and reagents reduces resource use, while also helping cut down on research time and effort.</p>
              <p>Blurring the boundary between physical and digital, SE allows scientists to create any and all kind of sales and licensing arrangements for research assets and data, be they MTAs or NFTs.</p>
            </div>
            <div className="hero-buttons">
              <Link href="/samples" className="btn btn-primary">Browse Samples</Link>
              <Link href="/about" className="btn btn-secondary">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className="features">
        <div className="section-background" style={{ backgroundImage: 'url(/assets/images/boxes.jpg)' }}></div>
        <div className="container">
          <h2 className="section-heading">Why Sample Exchange?</h2>
          <div className="feature-grid">
            <div className="feature" onClick={() => window.location.href='/samples'}>
              <h3>Decentralized Repositories</h3>
              <p>We are aiming to decentralize sample repositories; each lab becomes a repository</p>
            </div>
            <div className="feature" onClick={() => window.location.href='#digital-assets'}>
              <h3>Digital Scientific Assets</h3>
              <p>Create, license and trade digital assets (like NFTs) developed from samples, data and research assets</p>
            </div>
            <div className="feature" onClick={() => window.location.href='#small-labs'}>
              <h3>Focus on Small Labs</h3>
              <p>All players are equal on the platform and get equal attention from researchers, improving visibility for smaller labs</p>
            </div>
            <div className="feature" onClick={() => window.location.href='/samples'}>
              <h3>Inventory Management</h3>
              <p>Let us help you manage, store, digitize and out-license your research inventory</p>
              <Link href="/samples" className="btn btn-secondary">View our inventory management services &gt;&gt;</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials" id="testimonials">
        <div className="section-background" style={{ backgroundImage: 'url(/assets/images/testimonials.jpg)' }}></div>
        <div className="container">
          <h2>What the community is saying...</h2>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <p>"There is definitely a need in the scientific community for something like Sample Exchange. In the lab, there are always unused samples and machinery that are just collecting dust. It is also extremely hard to find materials from other groups without an already established connection."</p>
              <cite>- Harvard Biology PhD Student</cite>
            </div>
            <div className="testimonial-card">
              <p>"Sample Exchange sounds like it would make our lives easier tremendously. Having an online marketplace takes away the stress from just emailing random people and hoping for a reply."</p>
              <cite>- Harvard Pathologist/Scientist</cite>
            </div>
          </div>
        </div>
      </section>

      <section className="showcase" id="demo">
        <div className="showcase-background">
          <div className="showcase-overlay"></div>
        </div>
        <div className="container">
          <h2>Showcase lab!!</h2>
          <div className="showcase-content">
            <p>"I have always felt that there should be another way to communicate with scientists besides publications. I think sample exchange will help.</p>
            <p>I am creating a collection of aquatic samples (the "Dumbarton Collection"), I am happy to share these with other researchers".</p>
            <cite>Jean-Marie Volland, Ph.D.<br />Group Leader (Marine Microbiology)<br />LRC & JGI</cite>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="container">
          <h2>Get In Touch</h2>
          <p className="section-subtitle">
            Have questions about our platform or services? Send us a message and we'll get back to you.
          </p>
          
          <div className="contact-container">
            <ContactForm 
              title="Contact Us" 
              subtitle="We'd love to hear from you! Fill out the form below and we'll respond as soon as possible."
              compact={true}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
