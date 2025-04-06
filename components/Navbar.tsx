'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  
  // Check if we're on a specific page
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/assets/images/logo.png" 
              alt="Sample Exchange" 
              width={160} 
              height={48} 
              className="h-12 w-auto" 
            />
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/explore" className={`text-gray-700 hover:text-teal-600 ${pathname === '/explore' ? 'font-semibold' : ''}`}>
              Explore
            </Link>
            <Link href="/samples" className={`text-gray-700 hover:text-teal-600 ${pathname === '/samples' ? 'font-semibold' : ''}`}>
              Samples
            </Link>
            <Link href="/#contact" className={`text-gray-700 hover:text-teal-600 ${pathname === '/contact' ? 'font-semibold' : ''}`}>
              Contact
            </Link>
            <Link href="/debug" className={`text-gray-700 hover:text-teal-600 ${pathname === '/debug' ? 'font-semibold' : ''}`}>
              Debug
            </Link>
            
            <div className="ml-6 flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md">
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
