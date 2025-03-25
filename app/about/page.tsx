'use client'

import Image from 'next/image'
import { FaLeaf, FaFlask, FaBrain, FaDna, FaChartLine, FaDatabase, FaHandshake, FaFileContract } from 'react-icons/fa'
import './about.css'

export default function About() {
  return (
    <main className="about-page">
      {/* Mission Section - Hero */}
      <section className="about-hero">
        <h1>Our Mission</h1>
        <p>
          At Sample Exchange, we're committed to building a collaborative ecosystem for scientific sample sharing. 
          We believe that by connecting researchers and institutions, we can accelerate scientific discovery 
          and make research more efficient and cost-effective.
        </p>
      </section>

      {/* Story Section */}
      <section className="about-section alt">
        <div className="container">
          <h2>The Sample Exchange Story</h2>
          <div className="story-grid">
            <div className="story-tile">
              <div className="story-content">
                <p className="mb-4">
                  Scientists are always scrounging around for money. We realized we didn't have enough grant funding to organize yet another expensive sample collection trip to Alaska, to get permafrost samples. A researcher from the U. of Alaska helped us out by collecting samples and sharing them with us for free! How wonderful!
                </p>
                <p className="font-medium">
                  You can say with Sample Exchange, we are simply paying it forward!
                </p>
              </div>
            </div>
            <div className="story-tile">
              <div className="story-image">
                <Image
                  src="/assets/images/permafrost-image.jpeg"
                  alt="Permafrost Core"
                  width={400}
                  height={300}
                  className="story-img"
                  priority
                />
                <p className="image-caption">
                  Example of a Permafrost Core<br />
                  <span className="image-credit">Image courtesy: Permafrost Laboratory, U. of Alaska (Fairbanks)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="about-section">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-header">
                  <span className="service-icon">{service.icon}</span>
                </div>
                <div className="service-content">
                  <h3 className="service-title">{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

const services = [
  {
    title: "Environmental Sample Collection",
    description: "Professional collection of environmental samples from diverse ecosystems with proper documentation and handling protocols.",
    icon: <FaLeaf />
  },
  {
    title: "Strain, Tissue, Culture Collection",
    description: "Specialized collection and preservation of biological strains, tissues, and cultures for research purposes.",
    icon: <FaFlask />
  },
  {
    title: "Intelligent Sample Management",
    description: "Advanced framework for tracking, organizing, and managing samples throughout their lifecycle.",
    icon: <FaBrain />
  },
  {
    title: "Biological Sample Processing",
    description: "Expert processing of biological samples using state-of-the-art techniques and equipment.",
    icon: <FaDna />
  },
  {
    title: "Custom Analytical Methods",
    description: "Development of tailored analytical methods to meet specific research requirements and objectives.",
    icon: <FaChartLine />
  },
  {
    title: "Data Interpretation & Reporting",
    description: "Comprehensive analysis and reporting of sample data with clear, actionable insights.",
    icon: <FaDatabase />
  },
  {
    title: "Sampling Consultation",
    description: "Expert guidance on sampling strategies, protocols, and permit requirements for research projects.",
    icon: <FaHandshake />
  },
  {
    title: "MTA Support",
    description: "Assistance with Material Transfer Agreements to ensure proper legal and ethical sample sharing.",
    icon: <FaFileContract />
  }
]; 