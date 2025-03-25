import type { Metadata } from 'next';
import './globals.css'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'SampleX',
  description: 'Sample Exchange Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="container">
            <div className="logo">
              <Link href="/">
                <Image 
                  src="/assets/images/logo.png" 
                  alt="Sample Exchange Logo" 
                  width={240} 
                  height={70} 
                  priority
                  className="header-logo"
                />
              </Link>
            </div>
            <nav className="main-nav">
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/samples">Samples</Link></li>
                <li><Link href="/team">Team</Link></li>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li className="auth-links">
                  <Link href="/login" className="btn btn-outline">Login</Link>
                  <Link href="/register" className="btn btn-primary">Sign Up</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        
        {children}
        
        <footer className="site-footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-logo">
                <h2 className="footer-brand">Sample<span className="text-accent">X</span></h2>
                <p>
                  Revolutionizing science collaboration through seamless sample management and exchange.
                </p>
              </div>
              
              <div className="footer-links">
                <div className="footer-section">
                  <h3>Explore</h3>
                  <ul>
                    <li><Link href="/samples">Browse Samples</Link></li>
                    <li><Link href="/team">Our Team</Link></li>
                    <li><Link href="/about">About Us</Link></li>
                  </ul>
                </div>
                
                <div className="footer-section">
                  <h3>Resources</h3>
                  <ul>
                    <li><Link href="/faq">FAQ</Link></li>
                    <li><Link href="/terms">Terms of Service</Link></li>
                    <li><Link href="/privacy">Privacy Policy</Link></li>
                  </ul>
                </div>
                
                <div className="footer-section">
                  <h3>Contact</h3>
                  <ul>
                    <li><Link href="/contact">Contact Us</Link></li>
                    <li><a href="mailto:info@sample.exchange">info@sample.exchange</a></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p className="footer-address">655 Oak Grove Ave. #1417, Menlo Park, California 94025</p>
              <p>&copy; {new Date().getFullYear()} SampleX. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
