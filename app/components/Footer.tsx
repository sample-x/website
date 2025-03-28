import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h2 className="text-2xl font-bold mb-4">Sample<span className="text-blue-500">X</span></h2>
            <p className="text-gray-400">
              Revolutionizing science collaboration through seamless sample management and exchange.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li><Link href="/samples" className="text-gray-400 hover:text-white">Browse Samples</Link></li>
              <li><Link href="/team" className="text-gray-400 hover:text-white">Our Team</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white">Overview</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              <li><a href="mailto:info@sample.exchange" className="text-gray-400 hover:text-white">info@sample.exchange</a></li>
              <li><p className="text-gray-400">655 Oak Grove Ave. #1417<br />Menlo Park, CA 94025</p></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} SampleX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 