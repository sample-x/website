'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import GoogleButton from '../components/GoogleButton'
import './login.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, googleLogin } = useAuth()
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await login(email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
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
          <h1>Sign In</h1>
          <p>Access your Sample Exchange account</p>
        </div>
        
        <div className="login-container">
          <div className="login-card">
            <h2>Welcome Back</h2>
            
            <GoogleButton 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              text="Sign in with Google"
            />
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              
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
                />
              </div>
              
              <div className="forgot-password">
                <Link href="/forgot-password">Forgot password?</Link>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary login-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            
            <div className="register-link">
              Don't have an account? <Link href="/register">Sign Up</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 