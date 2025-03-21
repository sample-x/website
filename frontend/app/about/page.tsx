'use client'

import Image from 'next/image'
import ImageWithFallback from '@/components/ImageWithFallback'

export default function AboutPage() {
  return (
    <main>
      <section className="about" style={{ paddingTop: '8rem' }}>
        <div className="container">
          <h1 className="section-title">About SampleX</h1>
          
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '3rem' }}>
              <Image 
                src="/assets/about-banner.jpg" 
                alt="SampleX Laboratory" 
                width={1200}
                height={400}
                className="w-full h-64 object-cover rounded-lg shadow-md mb-8"
              />
              
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--secondary-color)' }}>Our Mission</h2>
              <p style={{ marginBottom: '1.5rem' }}>
                At SampleX, our mission is to provide high-quality sample collection, processing, and analysis 
                services that enable researchers, industries, and environmental agencies to make informed 
                decisions based on accurate and reliable data.
              </p>
              
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--secondary-color)' }}>Our Story</h2>
              <p style={{ marginBottom: '1.5rem' }}>
                Founded in 2010, SampleX began as a small laboratory focused on water quality analysis. 
                Over the years, we have expanded our capabilities to include soil, air, and biological 
                sample analysis, becoming a comprehensive provider of environmental and research sampling services.
              </p>
              <p style={{ marginBottom: '1.5rem' }}>
                Our growth has been driven by a commitment to scientific excellence, technological innovation, 
                and exceptional customer service. Today, we serve clients across multiple sectors, including 
                academic research, environmental consulting, industrial manufacturing, and government agencies.
              </p>
              
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--secondary-color)' }}>Our Approach</h2>
              <p style={{ marginBottom: '1.5rem' }}>
                We believe in a collaborative approach to sample collection and analysis. Our team works 
                closely with clients to understand their specific needs and objectives, designing customized 
                sampling protocols and analytical methods to deliver the most relevant and actionable results.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
                <div style={{ backgroundColor: 'var(--light-bg)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--secondary-color)' }}>Our Services</h3>
                  <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '0' }}>
                    <li>Environmental sample collection</li>
                    <li>Water quality analysis</li>
                    <li>Soil composition testing</li>
                    <li>Air quality monitoring</li>
                    <li>Biological sample processing</li>
                    <li>Custom analytical method development</li>
                    <li>Data interpretation and reporting</li>
                  </ul>
                </div>
                
                <div style={{ backgroundColor: 'var(--light-bg)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--secondary-color)' }}>Our Facilities</h3>
                  <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '0' }}>
                    <li>10,000 sq ft state-of-the-art laboratory</li>
                    <li>Advanced analytical instrumentation</li>
                    <li>Dedicated sample preparation areas</li>
                    <li>Controlled environment storage facilities</li>
                    <li>Field sampling equipment and vehicles</li>
                    <li>Data processing and visualization center</li>
                    <li>Training and conference facilities</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 