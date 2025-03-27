'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { isStaticExport } from '@/app/lib/staticData'

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  isStaticMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStaticMode, setIsStaticMode] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    // Check if we're in static deployment mode
    const staticMode = isStaticExport()
    setIsStaticMode(staticMode)
    
    // In static mode, skip authentication checks
    if (staticMode) {
      setLoading(false)
      return
    }
    
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('authToken')
        
        if (token) {
          // Verify token with backend
          const response = await fetch('http://localhost:5000/api/auth/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            setUser(userData.user)
          } else {
            // Token invalid, remove it
            localStorage.removeItem('authToken')
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkLoggedIn()
  }, [])

  // Regular email/password login
  const login = async (email: string, password: string) => {
    // In static mode, show a message that authentication is not available
    if (isStaticMode) {
      setError('Authentication is not available in static mode')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }
      
      localStorage.setItem('authToken', data.token)
      setUser(data.user)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth login
  const googleLogin = async () => {
    // In static mode, show a message that authentication is not available
    if (isStaticMode) {
      setError('Authentication is not available in static mode')
      return
    }
    
    try {
      // Open a popup window for Google login
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        'http://localhost:5000/api/auth/google',
        'Google Login',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
      
      // Create a promise that will resolve when the popup sends a message
      const authResult = await new Promise<{token: string, user: User}>((resolve, reject) => {
        // Set up message event listener
        const handleMessage = (event: MessageEvent) => {
          // Only accept messages from our backend
          if (event.origin !== 'http://localhost:5000') return;
          
          window.removeEventListener('message', handleMessage);
          
          if (event.data.type === 'AUTH_SUCCESS') {
            resolve(event.data);
          } else {
            reject(new Error(event.data.message || 'Google login failed'));
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Also handle popup closing without sending a message
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            reject(new Error('Login window closed'));
          }
        }, 1000);
      });
      
      // If we get here, authentication was successful
      localStorage.setItem('authToken', authResult.token);
      setUser(authResult.user);
      
    } catch (error) {
      console.error('Google login error:', error);
      setError(error instanceof Error ? error.message : 'Google login failed');
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    // In static mode, just clear any state
    if (isStaticMode) {
      setUser(null)
      return
    }
    
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('authToken')
      setUser(null)
    }
  }

  // Register new user
  const register = async (name: string, email: string, password: string) => {
    // In static mode, show a message that registration is not available
    if (isStaticMode) {
      setError('Registration is not available in static mode')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      
      // Auto login after registration
      await login(email, password)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      googleLogin, 
      logout, 
      register,
      isStaticMode
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 