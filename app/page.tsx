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
              <p>"In conversation: You are making me reach for my wallet! Haha! We had the best cell lines. Maybe we should license them out."</p>
              <cite>- Former CSO, Biotech</cite>
            </div>
            <div className="testimonial-card">
              <p>"I remember ordering 2nd hand equipment off Ebay and having to beg people for introductions to people with samples we are interested in. I wasted so much time trying to find people. This would have totally made my life easier!"</p>
              <cite>- Harvard Scientist</cite>
            </div>
            <div className="testimonial-card">
              <p>"Sample Exchange sounds like it would make our lives easier tremendously. Having an online marketplace takes away the stress from just emailing random people and hoping for a reply."</p>
              <cite>- Harvard Pathologist/Scientist</cite>
            </div>
            <div className="testimonial-card">
              <p>"P.S. I did look at Sample Exchange last night – really like the idea as we discussed. I hope it flies, cause it should!"</p>
              <cite>- Former CEO, Biotech</cite>
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

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="container">
          <h2>Our Mission</h2>
          <div className="about-content">
            <p>At Sample Exchange, we're committed to building a collaborative ecosystem for scientific sample sharing. We believe that by connecting researchers and institutions, we can accelerate scientific discovery and make research more efficient and cost-effective.</p>
            
            <h3>The Sample Exchange Story</h3>
            <p>Scientists are always scrounging around for money. We realized we didn't have enough grant funding to organize yet another expensive sample collection trip to Alaska, to get permafrost samples. A researcher from the U. of Alaska helped us out by collecting samples and sharing them with us for free! How wonderful!</p>
            <p>You can say with Sample Exchange, we are simply paying it forward!</p>
            
            <div className="image-container my-6">
              <img src="/assets/images/permafrost-core.jpg" alt="Permafrost Core" className="rounded-lg shadow-md" />
              <p className="text-sm text-gray-600 mt-2 italic">Example of a Permafrost Core<br />Image courtesy: Permafrost Laboratory, U. of Alaska (Fairbanks)</p>
            </div>
            
            <h3>Our Services</h3>
            <div className="services-grid grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="service-card p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2">Environmental Sample Collection</h4>
                <p className="text-gray-700">Professional collection of environmental samples from diverse ecosystems with proper documentation and handling protocols.</p>
              </div>
              
              <div className="service-card p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2">Strain, Tissue, Culture Collection</h4>
                <p className="text-gray-700">Specialized collection and preservation of biological strains, tissues, and cultures for research purposes.</p>
              </div>
              
              <div className="service-card p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2">Intelligent Sample Management</h4>
                <p className="text-gray-700">Advanced framework for tracking, organizing, and managing samples throughout their lifecycle.</p>
              </div>
              
              <div className="service-card p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2">Biological Sample Processing</h4>
                <p className="text-gray-700">Expert processing of biological samples using state-of-the-art techniques and equipment.</p>
              </div>
              
              <div className="service-card p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2">Custom Analytical Methods</h4>
                <p className="text-gray-700">Development of tailored analytical methods to meet specific research requirements and objectives.</p>
              </div>
              
              <div className="service-card p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2">Data Interpretation & Reporting</h4>
                <p className="text-gray-700">Comprehensive analysis and reporting of sample data with clear, actionable insights.</p>
              </div>
              
              <div className="service-card p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2">Sampling Consultation</h4>
                <p className="text-gray-700">Expert guidance on sampling strategies, protocols, and permit requirements for research projects.</p>
              </div>
              
              <div className="service-card p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2">MTA Support</h4>
                <p className="text-gray-700">Assistance with Material Transfer Agreements to ensure proper legal and ethical sample sharing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
