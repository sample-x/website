import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="text-white py-16" style={{ backgroundColor: "#21414d" }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1">
            <div className="mb-6 transform transition-transform hover:opacity-90">
              <Link href="/">
                <Image 
                  src="/assets/images/logo.png" 
                  alt="SampleX" 
                  width={180} 
                  height={60} 
                  className="object-contain"
                  priority
                />
              </Link>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              Revolutionizing science collaboration through seamless sample management and exchange.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-5 text-white relative inline-block">
              Explore
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-[#f59e0b]"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/samples" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Browse Samples
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/#overview" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Overview
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-5 text-white relative inline-block">
              Resources
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-[#f59e0b]"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-5 text-white relative inline-block">
              Contact
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-[#f59e0b]"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:info@sample.exchange" className="text-gray-300 hover:text-white transition-colors duration-200">
                  info@sample.exchange
                </a>
              </li>
              <li>
                <p className="text-gray-300">
                  655 Oak Grove Ave. #1417<br />
                  Menlo Park, CA 94025
                </p>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-700/50 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} SampleX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 