import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="text-white py-12" style={{ backgroundColor: "#21414d" }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="mb-4">
              <Image 
                src="/assets/images/samplex.png" 
                alt="SampleX Logo" 
                width={150} 
                height={50} 
              />
            </div>
            <p className="text-gray-300">
              Revolutionizing science collaboration through seamless sample management and exchange.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li><Link href="/samples" className="text-gray-300 hover:text-white">Browse Samples</Link></li>
              <li><Link href="/team" className="text-gray-300 hover:text-white">Our Team</Link></li>
              <li><Link href="/#overview" className="text-gray-300 hover:text-white">Overview</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-gray-300 hover:text-white">FAQ</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact Us</Link></li>
              <li><a href="mailto:info@sample.exchange" className="text-gray-300 hover:text-white">info@sample.exchange</a></li>
              <li><p className="text-gray-300">655 Oak Grove Ave. #1417<br />Menlo Park, CA 94025</p></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} SampleX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 