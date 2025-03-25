'use client'

import Image from 'next/image'
import { FaLeaf, FaFlask, FaBrain, FaDna, FaChartLine, FaDatabase, FaHandshake, FaFileContract } from 'react-icons/fa'

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Mission Section - Moved to top */}
      <section className="py-12 bg-gradient-to-r from-orange-500 to-amber-400 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <p className="text-lg leading-relaxed">
                At Sample Exchange, we're committed to building a collaborative ecosystem for scientific sample sharing. 
                We believe that by connecting researchers and institutions, we can accelerate scientific discovery 
                and make research more efficient and cost-effective.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-white py-16 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <Image
              src="/logo.png"
              alt="SampleX Logo"
              width={320}
              height={106}
              className="mx-auto mb-8"
            />
            <h2 className="text-3xl font-bold mb-6 text-[#1f3d4c]">The Sample Exchange Story</h2>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <p className="text-lg text-gray-700 leading-relaxed">
                Scientists are always scrounging around for money. We realized we didn't have enough grant funding to organize yet another expensive sample collection trip to Alaska, to get permafrost samples. A researcher from the U. of Alaska helped us out by collecting samples and sharing them with us for free! How wonderful!
              </p>
              <p className="text-lg text-gray-700 mt-4 font-medium">
                You can say with Sample Exchange, we are simply paying it forward!
              </p>
            </div>
          </div>
        </div>
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-full opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-50 rounded-full opacity-70 translate-x-1/3 translate-y-1/3"></div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#1f3d4c]">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
                <div className="bg-gradient-to-r from-orange-500 to-amber-400 p-4 flex justify-center items-center">
                  <span className="text-white text-3xl">{service.icon}</span>
                </div>
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-semibold mb-3 text-[#1f3d4c]">{service.title}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#1f3d4c]">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                <div className="flex flex-col h-full">
                  <div className="bg-gradient-to-r from-blue-600 to-teal-400 pt-6 px-6 pb-16 relative">
                    <div className="w-28 h-28 mx-auto relative z-10 bg-white rounded-full p-1">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={112}
                        height={112}
                        className="rounded-full object-cover h-full w-full"
                      />
                    </div>
                  </div>
                  <div className="p-6 -mt-12 relative z-20">
                    <div className="bg-white rounded-xl shadow-md p-5">
                      <h3 className="text-xl font-bold mb-2 text-[#1f3d4c] text-center">{member.name}</h3>
                      <p className="text-gray-500 text-center text-sm mb-3">{member.title}</p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {member.bio}
                      </p>
                    </div>
                  </div>
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