'use client'

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faFlask, faSignOutAlt, faCaretDown, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/app/context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { itemCount } = useCart();

  // Check if we're on a specific page
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Detect dark mode
  useEffect(() => {
    // Initial check for dark mode
    const checkDarkMode = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };
    
    checkDarkMode();
    
    // Listen for changes in dark mode preference
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    // Add event listener for dark mode changes
    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
    
    // Clean up event listener
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Determine which logo to use
  const logoSrc = isDarkMode ? '/assets/images/logo_dark.png' : '/assets/images/logo_light.png';

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0).toUpperCase()}${profile.last_name.charAt(0).toUpperCase()}`;
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="bg-white shadow-sm dark:bg-[#003949]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src={logoSrc} 
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
              className="flex items-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-800"
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
            <Link href="/" className="text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400">
              Explore
            </Link>
            <Link href="/samples" className="text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400">
              Samples
            </Link>
            <Link href="/demo" className="text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400">
              Demo
            </Link>
            <Link href="/#contact" className="text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400">
              Contact
            </Link>
            <Link href="/debug" className="text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400">
              Debug
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link
                href="/cart"
                className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-500"
              >
                <FontAwesomeIcon 
                  icon={faShoppingCart} 
                  className={`h-5 w-5 ${itemCount > 0 ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'}`} 
                />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-orange-500 rounded-full">
                    {itemCount}
                  </span>
                )}
                <span className="ml-1 sr-only md:not-sr-only">Cart</span>
              </Link>
            </div>

            <div className="ml-6 flex items-center gap-3">
              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white">
                      {getUserInitials()}
                    </div>
                    <span className="text-sm font-medium mr-1">{profile?.first_name || 'User'}</span>
                    <FontAwesomeIcon icon={faCaretDown} className="text-gray-400" />
                  </button>
                  
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 dark:bg-gray-800">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile?.first_name} {profile?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                      
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FontAwesomeIcon icon={faCog} className="mr-2" />
                        Settings
                      </Link>
                      
                      <Link
                        href="/samples/my-samples"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FontAwesomeIcon icon={faFlask} className="mr-2" />
                        My Samples
                      </Link>
                      
                      <button
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                    style={{ 
                      color: '#f59e0b', 
                      borderColor: '#f59e0b' 
                    }}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-4 py-2 text-white rounded-md hover:opacity-90"
                    style={{ 
                      backgroundColor: '#f59e0b' 
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              Explore
            </Link>
            <Link
              href="/samples"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              Samples
            </Link>
            <Link
              href="/demo"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              Demo
            </Link>
            <Link
              href="/#contact"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/debug"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              Debug
            </Link>
            
            <Link
              href="/cart"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon 
                icon={faShoppingCart} 
                className={`mr-2 ${itemCount > 0 ? 'text-orange-500' : ''}`} 
              />
              Cart
              {itemCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-orange-500 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="border-t border-gray-200 pt-4 mt-4 dark:border-gray-700">
                <div className="flex items-center px-3 py-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white">
                    {getUserInitials()}
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-800 dark:text-white">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  <FontAwesomeIcon icon={faCog} className="mr-2" />
                  Settings
                </Link>
                
                <Link
                  href="/samples/my-samples"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  <FontAwesomeIcon icon={faFlask} className="mr-2" />
                  My Samples
                </Link>
                
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 mt-4 px-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-center border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
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
            )}
          </div>
        </div>
      )}
    </header>
  );
}
