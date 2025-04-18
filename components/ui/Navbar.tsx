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
            <Link href="/login" className="btn btn-secondary">Sign In</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
