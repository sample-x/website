'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import SupabaseConnectionTest from '@/app/components/SupabaseConnectionTest';

export default function DebugPage() {
  const { supabase } = useSupabase();
  const [envVariables, setEnvVariables] = useState<{[key: string]: string}>({});
  const [testQuery, setTestQuery] = useState<{
    success: boolean;
    message: string;
    data: any;
  }>({
    success: false,
    message: 'Not run yet',
    data: null
  });

  useEffect(() => {
    // Get all the environment variables starting with NEXT_PUBLIC
    const publicEnvVars: {[key: string]: string} = {};
    
    // Client-side we can only access NEXT_PUBLIC_ environment variables
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        // Replace actual values with availability status for security
        const value = process.env[key] || '';
        publicEnvVars[key] = value ? `✅ Set (${value.substring(0, 8)}...)` : '❌ Not set';
      }
    });
    
    setEnvVariables(publicEnvVars);
  }, []);

  const runTestQuery = async () => {
    try {
      // Try a simple query to test the connection
      const { data, error } = await supabase
        .from('samples')
        .select('count', { count: 'exact' })
        .limit(1);
      
      if (error) {
        setTestQuery({
          success: false,
          message: `Error: ${error.message}`,
          data: error
        });
      } else {
        setTestQuery({
          success: true,
          message: 'Query successful',
          data
        });
      }
    } catch (error) {
      setTestQuery({
        success: false,
        message: `Exception: ${(error as Error).message}`,
        data: error
      });
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Debug Page</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl mb-4">Connection Status</h2>
        <SupabaseConnectionTest />
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl mb-4">Environment Variables</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Variable
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(envVariables).map(([key, value]) => (
                <tr key={key}>
                  <td className="py-2 px-4 border-b border-gray-200">{key}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{value}</td>
                </tr>
              ))}
              {Object.keys(envVariables).length === 0 && (
                <tr>
                  <td colSpan={2} className="py-2 px-4 border-b border-gray-200 text-center">
                    No public environment variables found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl mb-4">Test Query</h2>
        <button
          onClick={runTestQuery}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Run Test Query
        </button>
        
        <div className="mt-4">
          <h3 className="font-bold">Result:</h3>
          <div className={`p-4 mt-2 rounded ${testQuery.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-semibold">{testQuery.message}</p>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
              {JSON.stringify(testQuery.data, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-6">
          <li className="mb-2">
            Verify that Supabase URL and Anon Key are correctly set in your environment variables
          </li>
          <li className="mb-2">
            Check that your Supabase project is active and running
          </li>
          <li className="mb-2">
            Ensure your Cloudflare Pages project has the environment variables set correctly
          </li>
          <li className="mb-2">
            Verify network connectivity from Cloudflare Pages to Supabase (check CORS settings)
          </li>
          <li className="mb-2">
            Check browser console for any JavaScript errors
          </li>
        </ol>
      </div>
    </main>
  );
} 