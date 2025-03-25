'use client'

import { useEffect } from 'react'
import './team.css'
import Image from 'next/image'

export default function TeamPageClient() {
  useEffect(() => {
    // Add any initialization code here if needed
  }, [])

  return (
    <main>
      <section className="team-page">
        <div className="team-hero">
          <h1>Our Team</h1>
          <p>
            Meet the visionaries behind Sample Exchange, dedicated to revolutionizing 
            scientific collaboration and resource sharing.
          </p>
        </div>
        
        <div className="team-content">
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image">
                <img 
                  src="/assets/images/team/schulz.png" 
                  alt="Dr. Frederik Schulz"
                  className="circular-crop grayscale"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/team/placeholder.jpg';
                  }}
                />
              </div>
              <div className="member-info">
                <h2>Dr. Frederik Schulz</h2>
                <h3>Co-Founder, CEO</h3>
                <p>
                  Dr. Frederik Schulz is a microbiologist and expert in discovery and characterization of 
                  novel bacterial, archaeal, and eukaryotic microbes and viruses in environmental samples. 
                </p>
                <p>
                  Dr. Schulz is a staff scientist at the DOE Joint Genome Institute at Lawrence Berkeley 
                  National Laboratory where he is leading the New Lineages of Life Group.
                </p>
              </div>
            </div>
            
            <div className="team-member">
              <div className="member-image">
                <img 
                  src="/assets/images/team/date.png" 
                  alt="Dr. Shailesh Date" 
                  className="circular-crop grayscale"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/team/placeholder.jpg';
                  }}
                />
              </div>
              <div className="member-info">
                <h2>Dr. Shailesh Date</h2>
                <h3>Founder</h3>
                <p>
                  Dr. Shailesh Date is Chief Executive Officer of the Laboratory for Research in Complex 
                  Systems (LRC), an independent research institute that uses rigorous quantitative approaches 
                  to solve high-value problems in the sciences and the society. He is also Associate Adjunct 
                  Professor of Epidemiology and Biostatistics at UCSF and Chief Executive Officer of 
                  Silicogenix Inc.
                </p>
                <p>
                  Dr. Date's research primarily focuses on developing computational tools (biology, chemistry) 
                  to analyze complex biological systems, pathways and multi-input processes with the goal of 
                  identifying points of intervention. His group also studies fundamental biophysical properties 
                  of living systems, including biological associations, at various scales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
