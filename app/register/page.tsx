'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '../context/SupabaseProvider'
import { toast } from 'react-toastify'
import '../login/login.css'
import { isStaticExport } from '@/app/lib/staticData'

// Client component to handle redirection logic
function RegisterForm() {
  const supabase = useSupabase()
  const [authLoading, setAuthLoading] = useState(false)
  const [isStatic, setIsStatic] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirect') || '/'

  useEffect(() => {
    // Check if we're in static mode
    setIsStatic(isStaticExport())
  }, [])

  const handleGoogleSignIn = async () => {
    // In static mode, show a message that auth is not available
    if (isStatic) {
      toast.info('Registration is not available in demo mode')
      return
    }
    
    try {
      setAuthLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`
        }
      })
      
      if (error) throw error
      // No redirect needed here as the auth state change will trigger a refresh
    } catch (error) {
      console.error('Error signing in with Google:', error)
      toast.error('Failed to sign in with Google. Please try again.')
    } finally {
      setAuthLoading(false)
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
            
            {isStatic && (
              <div className="static-mode-notice">
                <p>Running in demo mode. Registration is not available.</p>
              </div>
            )}
            
            <div className="auth-options">
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading || isStatic}
                className={`auth-button google-button ${isStatic ? 'disabled' : ''}`}
              >
                {authLoading ? 'Signing up...' : 'Sign up with Google'}
              </button>
            </div>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link href={`/login${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// Main page component with suspense boundary
export default function Register() {
  return (
    <Suspense fallback={
      <main>
        <section className="login-page">
          <div className="login-hero">
            <h1>Sign Up</h1>
            <p>Loading...</p>
          </div>
        </section>
      </main>
    }>
      <RegisterForm />
    </Suspense>
  )
} 