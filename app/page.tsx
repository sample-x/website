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
        {/* Mission Statement with gradient background */}
        <div className="py-12 text-center" style={{ 
          background: 'linear-gradient(135deg, #6B8F50 0%, #8D7B43 100%)',
          color: 'white'
        }}>
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="max-w-3xl mx-auto">
              At Sample Exchange, we're committed to building a collaborative ecosystem for scientific sample sharing. We believe that by connecting researchers and institutions, we can accelerate scientific discovery and make research more efficient and cost-effective.
            </p>
          </div>
        </div>
        
        {/* Sample Exchange Story */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">The Sample Exchange Story</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="mb-4">Scientists are always scrounging around for money. We realized we didn't have enough grant funding to organize yet another expensive sample collection trip to Alaska, to get permafrost samples. A researcher from the U. of Alaska helped us out by collecting samples and sharing them with us for free! How wonderful!</p>
                  <p className="mb-4">You can say with Sample Exchange, we are simply paying it forward!</p>
                </div>
                
                <div className="order-first md:order-last">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <img 
                      src="/assets/images/permafrost-core.jpg" 
                      alt="Permafrost Core" 
                      className="w-full h-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-600 mt-2 italic text-center">
                      Example of a Permafrost Core<br />
                      Image courtesy: Permafrost Laboratory, U. of Alaska (Fairbanks)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Services Section */}
        <div className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-12 text-center">Our Services</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {/* Environmental Sample Collection */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-16 flex items-center justify-center" style={{ 
                  background: 'linear-gradient(90deg, #6B8F50 0%, #8D7B43 100%)'
                }}>
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a6.5 6.5 0 00-6.5 6.5c0 3.59 2.91 6.5 6.5 6.5s6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5zm0 12A5.51 5.51 0 014.5 10 5.51 5.51 0 0110 4.5 5.51 5.51 0 0115.5 10 5.51 5.51 0 0110 15.5z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-1.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2">Environmental Sample Collection</h4>
                  <p className="text-gray-700">Professional collection of environmental samples from diverse ecosystems with proper documentation and handling protocols.</p>
                </div>
              </div>
              
              {/* Strain, Tissue, Culture Collection */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-16 flex items-center justify-center" style={{ 
                  background: 'linear-gradient(90deg, #6B8F50 0%, #8D7B43 100%)'
                }}>
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" />
                    <path d="M6 10a1 1 0 112 0v2a1 1 0 11-2 0v-2zm6 0a1 1 0 112 0v2a1 1 0 11-2 0v-2zm-3-4a1 1 0 112 0v6a1 1 0 11-2 0V6z" />
                  </svg>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2">Strain, Tissue, Culture Collection</h4>
                  <p className="text-gray-700">Specialized collection and preservation of biological strains, tissues, and cultures for research purposes.</p>
                </div>
              </div>
              
              {/* Intelligent Sample Management */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-16 flex items-center justify-center" style={{ 
                  background: 'linear-gradient(90deg, #6B8F50 0%, #8D7B43 100%)'
                }}>
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2">Intelligent Sample Management</h4>
                  <p className="text-gray-700">Advanced framework for tracking, organizing, and managing samples throughout their lifecycle.</p>
                </div>
              </div>
              
              {/* Biological Sample Processing */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-16 flex items-center justify-center" style={{ 
                  background: 'linear-gradient(90deg, #6B8F50 0%, #8D7B43 100%)'
                }}>
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2">Biological Sample Processing</h4>
                  <p className="text-gray-700">Expert processing of biological samples using state-of-the-art techniques and equipment.</p>
                </div>
              </div>
              
              {/* Custom Analytical Methods */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-16 flex items-center justify-center" style={{ 
                  background: 'linear-gradient(90deg, #6B8F50 0%, #8D7B43 100%)'
                }}>
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2">Custom Analytical Methods</h4>
                  <p className="text-gray-700">Development of tailored analytical methods to meet specific research requirements and objectives.</p>
                </div>
              </div>
              
              {/* Data Interpretation & Reporting */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-16 flex items-center justify-center" style={{ 
                  background: 'linear-gradient(90deg, #6B8F50 0%, #8D7B43 100%)'
                }}>
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2">Data Interpretation & Reporting</h4>
                  <p className="text-gray-700">Comprehensive analysis and reporting of sample data with clear, actionable insights.</p>
                </div>
              </div>
              
              {/* Sampling Consultation */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-16 flex items-center justify-center" style={{ 
                  background: 'linear-gradient(90deg, #6B8F50 0%, #8D7B43 100%)'
                }}>
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2">Sampling Consultation</h4>
                  <p className="text-gray-700">Expert guidance on sampling strategies, protocols, and permit requirements for research projects.</p>
                </div>
              </div>
              
              {/* MTA Support */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-16 flex items-center justify-center" style={{ 
                  background: 'linear-gradient(90deg, #6B8F50 0%, #8D7B43 100%)'
                }}>
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2">MTA Support</h4>
                  <p className="text-gray-700">Assistance with Material Transfer Agreements to ensure proper legal and ethical sample sharing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
