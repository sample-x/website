'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import GoogleButton from '../components/GoogleButton'
import '../login/login.css'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, googleLogin } = useAuth()
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setIsLoading(true)
    
    try {
      await register(name, email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleGoogleLogin = async () => {
    try {
      await googleLogin()
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed')
    }
  }
  
  return (
    <main>
      <section className="login-page">
        <div className="login-hero">
          <h1>Sign Up</h1>
          <p>Create your Sample Exchange account</p>
        </div>
        
        <div className="login-container">
          <div className="login-card">
            <h2>Join Sample Exchange</h2>
            
            <GoogleButton 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              text="Sign up with Google"
            />
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary login-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
            
            <div className="register-link">
              Already have an account? <Link href="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 