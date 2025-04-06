'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header>
      <div className="header-container">
        <div className="logo">
          <Link href="/">
            <span>Sample Exchange</span>
          </Link>
        </div>
        <nav className="nav-container">
          <div className="nav-links">
            <Link href="/samples">Browse Samples</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="auth-buttons">
            <Link href="/login" className="btn btn-outline">Sign In</Link>
            <a 
              href="/register" 
              className="btn btn-primary" 
              style={{ 
                backgroundColor: '#f29415 !important', 
                color: 'white !important',
                borderColor: '#f29415 !important',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              Sign Up
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
