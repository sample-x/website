'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [testData, setTestData] = useState<any>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('Testing Supabase connection...')
        
        // Test the connection by making a simple query
        const { data, error } = await supabase
          .from('_test_connection')
          .select('*')
          .limit(1)

        if (error) {
          console.error('Supabase query error:', error)
          throw error
        }

        console.log('Supabase test data:', data)
        setTestData(data)
        setConnectionStatus('success')
      } catch (error) {
        console.error('Detailed error:', error)
        setConnectionStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="supabase-test">
      <h3>Supabase Connection Test</h3>
      <div className="status-container">
        {connectionStatus === 'testing' && (
          <p className="status testing">Testing connection to Supabase...</p>
        )}
        {connectionStatus === 'success' && (
          <div className="status success">
            <p>Successfully connected to Supabase!</p>
            {testData && (
              <pre className="test-data">
                {JSON.stringify(testData, null, 2)}
              </pre>
            )}
          </div>
        )}
        {connectionStatus === 'error' && (
          <div className="status error">
            <p>Failed to connect to Supabase</p>
            <p className="error-message">{errorMessage}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .supabase-test {
          padding: 20px;
          border-radius: 8px;
          background: #f5f5f5;
          margin: 20px 0;
        }
        .status-container {
          margin-top: 10px;
        }
        .status {
          padding: 10px;
          border-radius: 4px;
          margin: 5px 0;
        }
        .testing {
          background: #fff3cd;
          color: #856404;
        }
        .success {
          background: #d4edda;
          color: #155724;
        }
        .error {
          background: #f8d7da;
          color: #721c24;
        }
        .error-message {
          font-size: 0.9em;
          margin-top: 5px;
          word-break: break-word;
        }
        .test-data {
          margin-top: 10px;
          padding: 10px;
          background: rgba(0,0,0,0.05);
          border-radius: 4px;
          font-size: 0.9em;
          overflow-x: auto;
        }
      `}</style>
    </div>
  )
} 