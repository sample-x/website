'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '../context/SupabaseProvider'
import { toast } from 'react-toastify'
import '../login/login.css'

// Client component to handle redirection logic
function RegisterForm() {
  const { signInWithGoogle, isLoading } = useSupabase()
  const [authLoading, setAuthLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirect') || '/'

  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true)
      await signInWithGoogle()
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
            
            <div className="auth-options">
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading || isLoading}
                className="auth-button google-button"
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