'use client'

export default function Navbar() {
  return (
    <header style={{
      backgroundColor: '#333',
      color: 'white',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem' }}>
          Sample Exchange
        </a>
      </div>
      <nav>
        <a href="/samples" style={{ color: 'white', marginRight: '1rem' }}>Samples</a>
        <a href="/about" style={{ color: 'white', marginRight: '1rem' }}>About</a>
        <a href="/contact" style={{ color: 'white', marginRight: '1rem' }}>Contact</a>
        <a href="/debug" style={{ color: 'white', marginRight: '1rem' }}>Debug</a>
      </nav>
      <div>
        <a href="/login" style={{ 
          color: 'white', 
          marginRight: '1rem',
          padding: '0.5rem 1rem',
          border: '1px solid white',
          borderRadius: '4px',
          textDecoration: 'none'
        }}>
          Sign In
        </a>
        <a href="/register" style={{ 
          backgroundColor: 'red',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}>
          TEST BUTTON
        </a>
      </div>
    </header>
  )
}
