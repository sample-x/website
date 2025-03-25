'use client'

import Image from 'next/image'
import ImageWithFallback from '../../components/ImageWithFallback'

export default function About() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <Image
            src="/logo.png"
            alt="SampleX Logo"
            width={400}
            height={133}
            className="mx-auto mb-8"
          />
          <h1 className="text-4xl font-bold mb-8 text-[#1f3d4c]">The Sample Exchange Story</h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Scientists are always scrounging around for money. We realized we didn't have enough grant funding to organize yet another expensive sample collection trip to Alaska, to get permafrost samples. A researcher from the U. of Alaska helped us out by collecting samples and sharing them with us for free! How wonderful!
          </p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mt-4">
            You can say with Sample Exchange, we are simply paying it forward!
          </p>
        </div>

        {/* Services Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#1f3d4c]">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-3 text-[#1f3d4c]">{service}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#1f3d4c]">Our Team</h2>
          <div className="space-y-16 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-64 h-64 relative flex-shrink-0">
                <Image
                  src="/frederik-schulz.jpg"
                  alt="Dr. Frederik Schulz"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[#1f3d4c]">Dr. Frederik Schulz</h3>
                <p className="text-gray-700 leading-relaxed">
                  Dr. Frederik Schulz is a microbiologist and expert in discovery and characterization of novel bacterial, archaeal, and eukaryotic microbes and viruses in environmental samples. Dr. Schulz is a staff scientist at the DOE Joint Genome Institute at Lawrence Berkeley National Laboratory where he is leading the New Lineages of Life Group. He has over 80 peer-reviewed publications with over 10 in Nature, Nature Biotechnology or Science, covering topics in Microbial Ecology, Virology and Bioinformatics.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-64 h-64 relative flex-shrink-0">
                <Image
                  src="/shailesh-date.jpg"
                  alt="Dr. Shailesh Date"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[#1f3d4c]">Dr. Shailesh Date</h3>
                <p className="text-gray-700 leading-relaxed">
                  Dr. Shailesh Date is a distinguished scientist with extensive experience in biotechnology and life sciences. He has made significant contributions to the field of sample management and biological research. His work focuses on developing innovative solutions for scientific sample collection, storage, and distribution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

const services = [
  "Environmental sample collection",
  "Strain, Tissue, Culture collection",
  "Intelligent sample management framework",
  "Biological sample processing",
  "Custom analytical method development",
  "Data interpretation and reporting",
  "Consulting for sampling and sampling permits",
  "MTA support"
]; 