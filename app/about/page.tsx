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
          <div className="story-container">
            <div className="text-center mb-6">
              <Image
                src="/logo.png"
                alt="SampleX Logo"
                width={240}
                height={80}
                className="mx-auto mb-6"
                priority
              />
            </div>
            <p className="mb-4">
              Scientists are always scrounging around for money. We realized we didn't have enough grant funding to organize yet another expensive sample collection trip to Alaska, to get permafrost samples. A researcher from the U. of Alaska helped us out by collecting samples and sharing them with us for free! How wonderful!
            </p>
            <p className="font-medium">
              You can say with Sample Exchange, we are simply paying it forward!
            </p>
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

      {/* Team Section */}
      <section className="about-section alt">
        <div className="container">
          <h2>Our Team</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-header">
                  <div className="team-avatar">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={120}
                      height={120}
                      className="object-cover w-full h-full"
                      priority
                    />
                  </div>
                </div>
                <div className="team-content">
                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-title">{member.title}</p>
                  <p>{member.bio}</p>
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

const teamMembers = [
  {
    name: "Dr. Frederik Schulz",
    title: "Lead Scientist & Microbiologist",
    image: "/frederik-schulz.jpg",
    bio: "Dr. Frederik Schulz is a microbiologist and expert in discovery and characterization of novel bacterial, archaeal, and eukaryotic microbes and viruses in environmental samples. Dr. Schulz is a staff scientist at the DOE Joint Genome Institute at Lawrence Berkeley National Laboratory where he is leading the New Lineages of Life Group. He has over 80 peer-reviewed publications with over 10 in Nature, Nature Biotechnology or Science, covering topics in Microbial Ecology, Virology and Bioinformatics."
  },
  {
    name: "Dr. Shailesh Date",
    title: "Senior Research Scientist",
    image: "/shailesh-date.jpg",
    bio: "Dr. Shailesh Date is a distinguished scientist with extensive experience in biotechnology and life sciences. He has made significant contributions to the field of sample management and biological research. His work focuses on developing innovative solutions for scientific sample collection, storage, and distribution."
  }
]; 