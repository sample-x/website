'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image 
              src="/assets/images/logo.png" 
              alt="Sample Exchange Logo" 
              width={240} 
              height={70} 
              priority
              className="h-12 w-auto"
            />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-gray-600 hover:text-gray-900 ${pathname === '/' ? 'font-semibold' : ''}`}
            >
              Home
            </Link>
            <Link 
              href="/samples" 
              className={`text-gray-600 hover:text-gray-900 ${pathname === '/samples' ? 'font-semibold' : ''}`}
            >
              Samples
            </Link>
            <Link 
              href="/about" 
              className={`text-gray-600 hover:text-gray-900 ${pathname === '/about' ? 'font-semibold' : ''}`}
            >
              Overview
            </Link>
            <Link 
              href="/contact" 
              className={`text-gray-600 hover:text-gray-900 ${pathname === '/contact' ? 'font-semibold' : ''}`}
            >
              Contact
            </Link>
            <Link 
              href="/debug" 
              className={`text-gray-600 hover:text-gray-900 ${pathname === '/debug' ? 'font-semibold' : ''}`}
            >
              Debug
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md border border-gray-300 hover:border-gray-400"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
