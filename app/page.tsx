'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import ContactForm from './components/ContactForm'
import Head from 'next/head'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Force video reload
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [])

  return (
    <main className="bg-[#F9F5EB]">
      {/* Add Google font link for Poppins */}
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Hero Section with fixed video background */}
      <section className="hero relative h-screen" id="top">
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 object-cover w-full h-full z-0"
        >
          <source src="/assets/videos/start.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#00757F]/60 to-[#f59e0b]/40 z-10"></div>
        
        <div className="relative z-20 h-full flex items-center">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl">
              <p className="uppercase tracking-[0.2em] text-base font-light mb-4 text-white">Redefining Scientific Exchange</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-8 text-white font-bold">The world's first marketplace for science</h1>
              <div className="hero-text mb-10 bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <p className="text-white/90 text-lg mb-4 font-light">Individual researchers, organizations and companies can share, monetize and out-license research assets which would otherwise remain locked up in storage and freezers.</p>
                <p className="text-white/90 text-lg mb-4 font-light">Sharing preliminary and intermediate products, hard-to-obtain samples, and difficult-to-produce libraries and reagents reduces resource use, while also helping cut down on research time and effort.</p>
                <p className="text-white/90 text-lg font-light">Blurring the boundary between physical and digital, SE allows scientists to create any and all kind of sales and licensing arrangements for research assets and data, be they MTAs or NFTs.</p>
              </div>
              <div className="hero-buttons flex flex-wrap gap-4">
                <Link href="/samples" className="btn btn-primary text-lg">Browse Samples</Link>
                <Link href="/about" className="btn btn-secondary text-lg">Learn More</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="overview" className="features py-8">
        <div className="section-background opacity-20" style={{ backgroundImage: 'url(/assets/images/boxes.jpg)' }}></div>
        <div className="container">
          <h2 className="section-heading text-center text-4xl mb-12 relative">
            <span className="inline-block relative">
              Why Sample Exchange?
              <div className="absolute -bottom-3 left-0 w-1/3 h-1 bg-[#f59e0b]"></div>
            </span>
          </h2>
          
          <div className="feature-grid grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="feature bg-white p-6 rounded-tl-3xl rounded-br-3xl shadow-lg transition-transform duration-300 hover:translate-y-[-8px] cursor-pointer relative overflow-hidden" onClick={() => window.location.href='/samples'}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#f59e0b]/20 transform rotate-45 translate-x-8 -translate-y-8"></div>
              <h3 className="text-2xl font-medium mb-3 text-[#00757F]">Decentralized Repositories</h3>
              <p className="text-[#263238] relative z-10">We are aiming to decentralize sample repositories; each lab becomes a repository</p>
            </div>
            
            <div className="feature bg-white p-6 rounded-tr-3xl rounded-bl-3xl shadow-lg transition-transform duration-300 hover:translate-y-[-8px] cursor-pointer relative overflow-hidden" onClick={() => window.location.href='#digital-assets'}>
              <div className="absolute top-0 left-0 w-16 h-16 bg-[#8BD7D7]/20 transform rotate-45 -translate-x-8 -translate-y-8"></div>
              <h3 className="text-2xl font-medium mb-3 text-[#00757F]">Digital Scientific Assets</h3>
              <p className="text-[#263238] relative z-10">Create, license and trade digital assets (like NFTs) developed from samples, data and research assets</p>
            </div>
            
            <div className="feature bg-white p-6 rounded-tl-3xl rounded-br-3xl shadow-lg transition-transform duration-300 hover:translate-y-[-8px] cursor-pointer relative overflow-hidden" onClick={() => window.location.href='#small-labs'}>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#F9BA48]/20 transform rotate-45 translate-x-8 translate-y-8"></div>
              <h3 className="text-2xl font-medium mb-3 text-[#00757F]">Focus on Small Labs</h3>
              <p className="text-[#263238] relative z-10">All players are equal on the platform and get equal attention from researchers, improving visibility for smaller labs</p>
            </div>
            
            <div className="feature bg-white p-6 rounded-tr-3xl rounded-bl-3xl shadow-lg transition-transform duration-300 hover:translate-y-[-8px] cursor-pointer relative overflow-hidden" onClick={() => window.location.href='/samples'}>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#f59e0b]/20 transform rotate-45 -translate-x-8 translate-y-8"></div>
              <h3 className="text-2xl font-medium mb-3 text-[#00757F]">Inventory Management</h3>
              <p className="text-[#263238] mb-4 relative z-10">Let us help you manage, store, digitize and out-license your research inventory</p>
              <Link href="/samples" className="btn btn-secondary inline-block">View our inventory management services &gt;&gt;</Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-16">
        {/* Mission Statement - with midcentury styling */}
        <div className="mb-16 py-16 text-white rounded-lg relative overflow-hidden" style={{ backgroundColor: "#21414d" }}>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[10%] left-[10%] w-32 h-32 rounded-full bg-[#f59e0b]/10"></div>
            <div className="absolute bottom-[15%] right-[15%] w-48 h-48 transform rotate-45 bg-[#8BD7D7]/10"></div>
          </div>
          <div className="container mx-auto text-center px-6 relative z-10">
            <h2 className="uppercase tracking-wider text-4xl font-light mb-8 text-white">Our Mission</h2>
            <p className="text-2xl max-w-3xl mx-auto font-light leading-relaxed text-white">
              To accelerate research by connecting scientists with the right 
              biological samples, empowering discoveries that improve human 
              and environmental health.
            </p>
          </div>
        </div>

        {/* Sample Exchange Story */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#00757F]">The Sample Exchange Story</h2>
              <div className="relative h-1 mx-auto bg-[#f59e0b] w-24 rounded"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <p className="text-lg text-gray-700 mb-6">
                  Sample Exchange was born from a simple observation: scientists waste countless hours trying to find the right samples for their research.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Our founders, having experienced this frustration firsthand in their academic careers, created a platform that connects researchers who need samples with those who have them.
                </p>
                <p className="text-lg text-gray-700">
                  Today, Sample Exchange is revolutionizing scientific collaboration by breaking down barriers to sample acquisition and fostering a community where sharing resources accelerates discovery.
                </p>
              </div>
              
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/assets/images/permafrost-core.jpg" 
                  alt="Permafrost Core Sample" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <div className="container mx-auto px-6">
          <h2 className="section-heading text-center text-4xl mb-12 relative">
            <span className="inline-block relative">
              Our Services
              <div className="absolute -bottom-3 left-1/4 right-1/4 h-1 bg-[#f59e0b]"></div>
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service Card 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:translate-y-[-8px]">
              <div className="p-5 flex justify-center relative overflow-hidden" style={{ backgroundColor: "#f59e0b" }}>
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full transform translate-x-6 -translate-y-6"></div>
                <svg className="w-10 h-10 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-3 text-[#00757F]">Sample Acquisition</h3>
                <p className="text-[#263238]/80">Find and acquire the exact samples you need for your research from our global network of providers.</p>
              </div>
            </div>
            
            {/* Service Card 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:translate-y-[-8px]">
              <div className="p-5 flex justify-center relative overflow-hidden" style={{ backgroundColor: "#f59e0b" }}>
                <div className="absolute top-0 left-0 w-12 h-12 bg-white/10 rounded-full transform -translate-x-6 -translate-y-6"></div>
                <svg className="w-10 h-10 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-3 text-[#00757F]">Sample Management</h3>
                <p className="text-[#263238]/80">Comprehensive tools to track, manage, and organize your biological samples and collections.</p>
              </div>
            </div>
            
            {/* Service Card 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:translate-y-[-8px]">
              <div className="p-5 flex justify-center relative overflow-hidden" style={{ backgroundColor: "#f59e0b" }}>
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full transform translate-x-6 -translate-y-6"></div>
                <svg className="w-10 h-10 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-3 text-[#00757F]">Exchange Platform</h3>
                <p className="text-[#263238]/80">List samples you can share or sell, facilitating collaboration between researchers globally.</p>
              </div>
            </div>
            
            {/* Service Card 4 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:translate-y-[-8px]">
              <div className="p-5 flex justify-center relative overflow-hidden" style={{ backgroundColor: "#f59e0b" }}>
                <div className="absolute top-0 left-0 w-12 h-12 bg-white/10 rounded-full transform -translate-x-6 -translate-y-6"></div>
                <svg className="w-10 h-10 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-3 text-[#00757F]">Quality Assurance</h3>
                <p className="text-[#263238]/80">Rigorous verification processes ensure all samples meet the highest quality standards.</p>
              </div>
            </div>
            
            {/* Service Card 5 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:translate-y-[-8px]">
              <div className="p-5 flex justify-center relative overflow-hidden" style={{ backgroundColor: "#f59e0b" }}>
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full transform translate-x-6 -translate-y-6"></div>
                <svg className="w-10 h-10 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H5.5z" />
                  <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-3 text-[#00757F]">Storage Solutions</h3>
                <p className="text-[#263238]/80">Access our network of certified storage facilities for short or long-term sample preservation.</p>
              </div>
            </div>
            
            {/* Service Card 6 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:translate-y-[-8px]">
              <div className="p-5 flex justify-center relative overflow-hidden" style={{ backgroundColor: "#f59e0b" }}>
                <div className="absolute top-0 left-0 w-12 h-12 bg-white/10 rounded-full transform -translate-x-6 -translate-y-6"></div>
                <svg className="w-10 h-10 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-3 text-[#00757F]">Authentication</h3>
                <p className="text-[#263238]/80">Verify the origin, type, and quality of samples through our certified authentication process.</p>
              </div>
            </div>
            
            {/* Service Card 7 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:translate-y-[-8px]">
              <div className="p-5 flex justify-center relative overflow-hidden" style={{ backgroundColor: "#f59e0b" }}>
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full transform translate-x-6 -translate-y-6"></div>
                <svg className="w-10 h-10 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-3 text-[#00757F]">Custom Collection</h3>
                <p className="text-[#263238]/80">Specialized collection services to gather specific samples according to your research needs.</p>
              </div>
            </div>
            
            {/* Service Card 8 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:translate-y-[-8px]">
              <div className="p-5 flex justify-center relative overflow-hidden" style={{ backgroundColor: "#f59e0b" }}>
                <div className="absolute top-0 left-0 w-12 h-12 bg-white/10 rounded-full transform -translate-x-6 -translate-y-6"></div>
                <svg className="w-10 h-10 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-3 text-[#00757F]">API Integration</h3>
                <p className="text-[#263238]/80">Connect your lab systems directly to our platform with our comprehensive API services.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* What the community is saying */}
      <section className="testimonials py-16" id="testimonials">
        <div className="section-background" style={{ backgroundImage: 'url(/assets/images/testimonials.jpg)' }}></div>
        <div className="container">
          <h2 className="section-heading text-center text-4xl mb-12 text-white relative">
            <span className="inline-block relative">
              What the community is saying...
              <div className="absolute -bottom-3 left-1/4 right-1/4 h-1 bg-[#f59e0b]"></div>
            </span>
          </h2>
          <div className="testimonial-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="testimonial-card bg-white/10 backdrop-blur-sm p-6 rounded-lg relative shadow-md">
              <div className="absolute top-0 left-0 w-20 h-3 bg-[#f59e0b]"></div>
              <p className="mb-4 text-white/90 italic">"There is definitely a need in the scientific community for something like Sample Exchange. In the lab, there are always unused samples and machinery that are just collecting dust. It is also extremely hard to find materials from other groups without an already established connection."</p>
              <cite className="text-white/80 text-sm font-medium block text-right">- Harvard Biology PhD Student</cite>
            </div>
            
            <div className="testimonial-card bg-white/10 backdrop-blur-sm p-6 rounded-lg relative shadow-md">
              <div className="absolute top-0 right-0 w-20 h-3 bg-[#8BD7D7]"></div>
              <p className="mb-4 text-white/90 italic">"In conversation: You are making me reach for my wallet! Haha! We had the best cell lines. Maybe we should license them out."</p>
              <cite className="text-white/80 text-sm font-medium block text-right">- Former CSO, Biotech</cite>
            </div>
            
            <div className="testimonial-card bg-white/10 backdrop-blur-sm p-6 rounded-lg relative shadow-md">
              <div className="absolute top-0 left-0 w-20 h-3 bg-[#F9BA48]"></div>
              <p className="mb-4 text-white/90 italic">"I remember ordering 2nd hand equipment off Ebay and having to beg people for introductions to people with samples we are interested in. I wasted so much time trying to find people. This would have totally made my life easier!"</p>
              <cite className="text-white/80 text-sm font-medium block text-right">- Harvard Scientist</cite>
            </div>
            
            <div className="testimonial-card bg-white/10 backdrop-blur-sm p-6 rounded-lg relative shadow-md">
              <div className="absolute top-0 right-0 w-20 h-3 bg-[#f59e0b]"></div>
              <p className="mb-4 text-white/90 italic">"Sample Exchange sounds like it would make our lives easier tremendously. Having an online marketplace takes away the stress from just emailing random people and hoping for a reply."</p>
              <cite className="text-white/80 text-sm font-medium block text-right">- Harvard Pathologist/Scientist</cite>
            </div>
            
            <div className="testimonial-card bg-white/10 backdrop-blur-sm p-6 rounded-lg relative shadow-md">
              <div className="absolute top-0 left-0 w-20 h-3 bg-[#8BD7D7]"></div>
              <p className="mb-4 text-white/90 italic">"P.S. I did look at Sample Exchange last night – really like the idea as we discussed. I hope it flies, cause it should!"</p>
              <cite className="text-white/80 text-sm font-medium block text-right">- Former CEO, Biotech</cite>
            </div>
          </div>
        </div>
      </section>
      
      {/* Showcase lab!! */}
      <section className="showcase py-16" id="demo">
        <div className="showcase-background">
          <div className="showcase-overlay bg-[#21414d]"></div>
        </div>
        <div className="container">
          <h2 className="section-heading text-center text-4xl mb-12 text-white relative">
            <span className="inline-block relative">
              Showcase lab!!
              <div className="absolute -bottom-3 left-1/4 right-1/4 h-1 bg-[#f59e0b]"></div>
            </span>
          </h2>
          <div className="showcase-content bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
            <p className="italic text-white mb-4 text-lg font-light">"I have always felt that there should be another way to communicate with scientists besides publications. I think sample exchange will help.</p>
            <p className="italic text-white mb-6 text-lg font-light">I am creating a collection of aquatic samples (the "Dumbarton Collection"), I am happy to share these with other researchers".</p>
            <cite className="text-white font-medium block text-right">Jean-Marie Volland, Ph.D.<br />Group Leader (Marine Microbiology)<br />LRC & JGI</cite>
          </div>
        </div>
      </section>

      {/* Contact Section with testimonials background color */}
      <section className="contact-section mt-16 mb-0 py-16 text-white relative overflow-hidden" id="contact" style={{ backgroundColor: "#21414d" }}>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[20%] left-[15%] w-40 h-40 rounded-full bg-[#f59e0b]/10"></div>
          <div className="absolute bottom-[10%] right-[10%] w-64 h-64 transform rotate-45 bg-[#8BD7D7]/10"></div>
        </div>
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
