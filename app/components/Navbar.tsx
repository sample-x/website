'use client'

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image src="/assets/images/logo.png" alt="SampleX Logo" width={40} height={40} className="mr-2" />
            <span className="text-xl font-bold text-gray-800">SampleX</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-6 items-center">
          <Link 
            href="/" 
            className={`text-sm font-medium text-gray-700 hover:text-gray-900 ${pathname === '/' ? 'font-bold' : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/samples" 
            className={`text-sm font-medium text-gray-700 hover:text-gray-900 ${pathname === '/samples' ? 'font-bold' : ''}`}
          >
            Samples
          </Link>
          <Link 
            href="/overview" 
            className={`text-sm font-medium text-gray-700 hover:text-gray-900 ${pathname === '/overview' ? 'font-bold' : ''}`}
          >
            Overview
          </Link>
          <Link 
            href="/contact" 
            className={`text-sm font-medium text-gray-700 hover:text-gray-900 ${pathname === '/contact' ? 'font-bold' : ''}`}
          >
            Contact
          </Link>
          <Link 
            href="/debug" 
            className={`text-sm font-medium text-gray-700 hover:text-gray-900 ${pathname === '/debug' ? 'font-bold' : ''}`}
          >
            Debug
          </Link>
          
          <div className="ml-6 flex items-center space-x-2">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-800 rounded-md hover:bg-gray-50"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-orange-600"
              style={{ backgroundColor: '#f29415' }}
            >
              Sign Up
            </Link>
          </div>
        </nav>
        
        <div className="md:hidden">
          <button className="text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
