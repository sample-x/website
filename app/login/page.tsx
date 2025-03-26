'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '../context/SupabaseProvider'
import { toast } from 'react-toastify'
import './login.css'

// Client component to handle redirection logic
function LoginForm() {
  const supabase = useSupabase()
  const [authLoading, setAuthLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirect') || '/'

  const handleGoogleSignIn = async () => {
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
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign In</h1>
        <p className="auth-description">
          Sign in to access your account, view samples, and make purchases.
        </p>

        <div className="auth-options">
          <button
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="auth-button google-button"
          >
            {authLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link href={`/register${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Main page component with suspense boundary
export default function Login() {
  return (
    <Suspense fallback={
      <div className="auth-container">
        <div className="auth-card">
          <h1>Sign In</h1>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
} 