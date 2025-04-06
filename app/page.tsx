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

      {/* About Section */}
      <section className="py-16">
        {/* Mission Statement - with same background color as testimonials */}
        <div className="mb-12 py-12 text-white rounded-lg" style={{ backgroundColor: "#21414d" }}>
          <div className="container mx-auto text-center px-6 relative z-10">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl max-w-3xl mx-auto">
              To accelerate research by connecting scientists with the right 
              biological samples, empowering discoveries that improve human 
              and environmental health.
            </p>
          </div>
        </div>

        {/* Sample Exchange Story */}
        <div className="container mx-auto px-6 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">The Sample Exchange Story</h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-gray-700 mb-4">
                Founded in 2020 by a team of scientists frustrated by the challenges of finding quality biological samples, 
                Sample Exchange has grown into the leading platform for scientific sample exchange.
              </p>
              <p className="text-gray-700 mb-4">
                Our platform connects researchers, biobanks, and sample providers globally, enabling 
                faster discoveries and more efficient resource utilization in the scientific community.
              </p>
              <p className="text-gray-700">
                With a focus on quality, traceability, and ethical sourcing, we're building the 
                future of sample management and exchange for scientific research.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <img
                  src="/assets/images/permafrost-core.jpg"
                  alt="Permafrost Core Sample"
                  className="rounded-lg w-full h-auto object-cover"
                />
                <p className="text-sm text-gray-600 mt-2 italic text-center">
                  Example of a Permafrost Core<br />
                  Image courtesy: Permafrost Laboratory, U. of Alaska (Fairbanks)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Service Card 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 flex justify-center" style={{ backgroundColor: "#f59e0b" }}>
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Sample Acquisition</h3>
                <p className="text-gray-600">Find and acquire the exact samples you need for your research from our global network of providers.</p>
              </div>
            </div>
            
            {/* Service Card 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 flex justify-center" style={{ backgroundColor: "#f59e0b" }}>
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Sample Management</h3>
                <p className="text-gray-600">Comprehensive tools to track, manage, and organize your biological samples and collections.</p>
              </div>
            </div>
            
            {/* Service Card 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 flex justify-center" style={{ backgroundColor: "#f59e0b" }}>
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Exchange Platform</h3>
                <p className="text-gray-600">List samples you can share or sell, facilitating collaboration between researchers globally.</p>
              </div>
            </div>
            
            {/* Service Card 4 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 flex justify-center" style={{ backgroundColor: "#f59e0b" }}>
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Quality Assurance</h3>
                <p className="text-gray-600">Rigorous verification processes ensure all samples meet the highest quality standards.</p>
              </div>
            </div>
            
            {/* Service Card 5 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 flex justify-center" style={{ backgroundColor: "#f59e0b" }}>
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H5.5z" />
                  <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Storage Solutions</h3>
                <p className="text-gray-600">Access our network of certified storage facilities for short or long-term sample preservation.</p>
              </div>
            </div>
            
            {/* Service Card 6 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 flex justify-center" style={{ backgroundColor: "#f59e0b" }}>
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Authentication</h3>
                <p className="text-gray-600">Verify the origin, type, and quality of samples through our certified authentication process.</p>
              </div>
            </div>
            
            {/* Service Card 7 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 flex justify-center" style={{ backgroundColor: "#f59e0b" }}>
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Custom Collection</h3>
                <p className="text-gray-600">Specialized collection services to gather specific samples according to your research needs.</p>
              </div>
            </div>
            
            {/* Service Card 8 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 flex justify-center" style={{ backgroundColor: "#f59e0b" }}>
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">API Integration</h3>
                <p className="text-gray-600">Connect your lab systems directly to our platform with our comprehensive API services.</p>
              </div>
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

      {/* Contact Section with testimonials background color */}
      <section className="contact-section mt-16 mb-0 py-16 text-white" id="contact" style={{ backgroundColor: "#21414d" }}>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            <ContactForm 
              title="Get in Touch" 
              subtitle="Have questions about our platform or services or request a demo? Send us a message and we'll get back to you."
              compact={true}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
