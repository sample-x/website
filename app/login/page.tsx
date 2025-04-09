'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/auth/AuthProvider'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faLock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import './login.css'
import { isStaticExport } from '@/app/lib/staticData'

export default function LoginPage() {
  const { signIn, signInWithGoogle, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStatic, setIsStatic] = useState(false)

  // Check for URL error parameters and static mode
  useEffect(() => {
    // Check for error in URL params
    const urlError = searchParams?.get('error')
    if (urlError) {
      if (urlError === 'redirect_uri_mismatch') {
        setError('Google login failed: Redirect URI mismatch. The authentication configuration needs to be updated for this domain.')
      } else {
        setError(`Authentication error: ${urlError}`)
      }
    }

    // Check for static mode
    if (typeof window !== 'undefined') {
      const staticMode = isStaticExport()
      setIsStatic(staticMode)
      
      if (staticMode) {
        console.log('Login page running in static mode - limited functionality')
      }
    }
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Safely get redirect path, default to /samples if searchParams is null
    const redirectPath = searchParams ? (searchParams.get('redirect') || '/samples') : '/samples'; 

    // In static mode, simulate login
    if (isStatic) {
      setTimeout(() => {
        // Set demo mode user
        localStorage.setItem('staticUser', JSON.stringify({ email, name: 'Demo User' }))
        toast.success('Demo mode: Logged in as demo user')
        router.push(redirectPath)
      }, 1000)
      return
    }

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        setError(error.message)
        toast.error('Login failed: ' + error.message)
      } else {
        toast.success('Login successful!')
        router.push(redirectPath)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred')
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
      // Redirect happens automatically after oauth
    } catch (err) {
      console.error('Google login error:', err)
      setError('Google login failed. Please try again.')
      toast.error('Google login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
          <p className="mt-2 text-gray-600">
            Welcome back to Sample Exchange
          </p>
        </div>

        {isStatic && (
          <div className="mb-4 p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Demo Mode:</strong> This is a static demo site. Authentication is simulated.
                </p>
                <p className="mt-1 text-xs text-yellow-600">
                  Use any email/password to sign in as a demo user.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-orange-600 hover:text-orange-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faGoogle} className="h-5 w-5 text-red-500 mr-2" />
                <span>Google</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-orange-600 hover:text-orange-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 