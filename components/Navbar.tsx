'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Cache buster
  console.log(`[Navbar EXTREME CHANGE] ${new Date().toISOString()}`);

  return (
    <header style={{ backgroundColor: 'yellow', border: '5px dashed red' }}>
      <div className="header-container">
        <div className="logo">
          <Link href="/">
            <span style={{ fontSize: '30px', color: 'red' }}>⚠️ TESTING DEPLOY ⚠️</span>
          </Link>
        </div>
        <nav className="nav-container">
          {/* COMMENTED OUT FOR TESTING
          <div className="nav-links">
            <Link href="/samples">Browse Samples</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          */}
          <div style={{ padding: '10px', backgroundColor: 'black', color: 'white' }}>
            VERIFY BUILD: {new Date().toISOString()}
          </div>
          <div className="auth-buttons">
            <Link href="/login" className="btn btn-outline" style={{ backgroundColor: 'green', color: 'white' }}>TESTING</Link>
            <Link href="/register" className="btn btn-primary" style={{ backgroundColor: 'purple', color: 'yellow', fontSize: '24px', padding: '20px' }}>EXTREME TEST</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
