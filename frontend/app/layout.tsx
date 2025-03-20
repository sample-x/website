'use client'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { metadata } from './metadata'

const inter = Inter({ subsets: ['latin'] })

// Create a client component for the header that can use the useAuth hook
function Header() {
  const { user, logout } = useAuth()
  
  return (
    <header>
      <nav className="navbar">
        <div className="header-container">
          <Link href="/" className="logo">
            <img 
              src="/assets/images/logo.png" 
              alt="SAMPLE EXCHANGE" 
              className="logo-img"
              key="logo-image" 
            />
          </Link>
          <div className="nav-container">
            <nav>
              <ul className="nav-links">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/#overview">Overview</Link></li>
                <li><Link href="/#testimonials">Testimonials</Link></li>
                <li><Link href="/team">Team</Link></li>
                <li><Link href="/samples">Samples</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/contact?demo=true" className="demo-link">Demo</Link></li>
              </ul>
            </nav>
            <div className="nav-right">
              {user ? (
                <div className="user-menu">
                  <button className="user-menu-button">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="user-avatar" />
                    ) : (
                      <div className="user-avatar-placeholder">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span>{user.name}</span>
                  </button>
                  <div className="user-dropdown">
                    <Link href="/profile">My Profile</Link>
                    <Link href="/my-samples">My Samples</Link>
                    <Link href="/orders">My Orders</Link>
                    <button onClick={logout}>Sign Out</button>
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link href="/login" className="btn btn-small">Sign In</Link>
                  <Link href="/register" className="btn btn-primary btn-small">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

// Create a client component for the footer
function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-section">
          <h3>Sample Exchange</h3>
          <ul>
            <li><Link href="/team">About Us</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>655 Oak Grove Ave. #1417</p>
          <p>Menlo Park, California 94025</p>
          <p>info (at) sample.exchange</p>
          <p>415-570-9067</p>
        </div>
        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/cookies">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="copyright">
        <p>&copy; {new Date().getFullYear()} Sample Exchange. All rights reserved.</p>
      </div>
    </footer>
  )
}

// Main layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}