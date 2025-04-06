'use client'

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-gray-700 hover:text-teal-600">
              Explore
            </Link>
            <Link href="/samples" className="text-gray-700 hover:text-teal-600">
              Samples
            </Link>
            <Link href="/#contact" className="text-gray-700 hover:text-teal-600">
              Contact
            </Link>
            <Link href="/debug" className="text-gray-700 hover:text-teal-600">
              Debug
            </Link>
            
            <div className="ml-6 flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                style={{ 
                  color: '#f59e0b', 
                  borderColor: '#f59e0b' 
                }}
              >
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md">
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/explore"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Explore
            </Link>
            <Link
              href="/samples"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Samples
            </Link>
            <Link
              href="/#contact"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/debug"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Debug
            </Link>
            <div className="flex flex-col space-y-2 mt-4 px-3">
              <Link
                href="/login"
                className="px-4 py-2 text-center border rounded-md hover:bg-gray-50"
                style={{ 
                  color: '#f59e0b', 
                  borderColor: '#f59e0b' 
                }}
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-center text-white rounded-md hover:opacity-90"
                style={{ 
                  backgroundColor: '#f59e0b' 
                }}
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
