'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/supabase-provider';
import SupabaseConnectionTest from '@/app/components/SupabaseConnectionTest';
import { isStaticExport } from '@/app/lib/staticData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faServer, faCode, faTrash, faUpload, faTable } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './debug.css';

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
  const [isStatic, setIsStatic] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Check if we're in static mode
    setIsStatic(isStaticExport());

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
    if (isStatic) {
      setTestQuery({
        success: false,
        message: 'Cannot run database queries in static mode',
        data: { note: 'Static deployment does not have a live connection to Supabase' }
      });
      return;
    }

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

  const deleteSamples = async () => {
    if (!confirm('Are you sure you want to delete ALL samples? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete all samples
      const { error } = await supabase
        .from('samples')
        .delete()
        .neq('id', 0); // This will delete all rows

      if (error) {
        throw error;
      }

      toast.success('Successfully deleted all samples');
    } catch (error) {
      console.error('Error deleting samples:', error);
      toast.error(`Failed to delete samples: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);

        if (lines.length < 2) {
          throw new Error('CSV file must contain headers and at least one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const requiredFields = ['name', 'type', 'location', 'collection_date', 'storage_condition', 'quantity', 'price'];
        const missingFields = requiredFields.filter(field => !headers.includes(field));

        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        const samples = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const sample: any = {};
          headers.forEach((header, index) => {
            sample[header] = values[index];
          });
          return sample;
        });

        const { error } = await supabase.from('samples').insert(samples);
        if (error) throw error;

        toast.success(`Successfully uploaded ${samples.length} samples`);
      };

      reader.onerror = () => {
        throw new Error('Error reading file');
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading samples:', error);
      toast.error(`Failed to upload samples: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = ''; // Reset file input
    }
  };

  const loadBuiltInSamples = async () => {
    setIsUploading(true);
    try {
      const response = await fetch('/data/samples.csv');
      const text = await response.text();
      
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const headers = lines[0].split(',').map(h => h.trim());
      const samples = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const sample: any = {};
        headers.forEach((header, index) => {
          sample[header] = values[index];
        });
        return sample;
      });

      const { error } = await supabase.from('samples').insert(samples);
      if (error) throw error;

      toast.success(`Successfully loaded ${samples.length} built-in samples`);
    } catch (error) {
      console.error('Error loading built-in samples:', error);
      toast.error(`Failed to load built-in samples: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 debug-page">
      <h1 className="text-3xl font-bold mb-6">Supabase Debug Page</h1>
      
      {isStatic ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-6">
          <h2 className="text-xl font-bold mb-2">
            <FontAwesomeIcon icon={faServer} className="mr-2" />
            Static Mode Detected
          </h2>
          <p className="mb-2">
            This page is running in static mode as part of a Cloudflare Pages deployment.
            In this mode, live Supabase database connections are not available.
          </p>
          <p>
            For full functionality with live database connectivity, please run the application
            in development mode or deploy to a platform that supports server-side rendering.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl mb-4">Connection Status</h2>
          <SupabaseConnectionTest />
        </div>
      )}
      
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
          className={`font-bold py-2 px-4 rounded mb-4 ${isStatic 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-700 text-white'}`}
          disabled={isStatic}
        >
          Run Test Query {isStatic && '(Disabled in Static Mode)'}
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
        <h2 className="text-2xl mb-4">
          <FontAwesomeIcon icon={faCode} className="mr-2" />
          Static/Dynamic Mode
        </h2>
        <div className="p-4 bg-gray-100 rounded">
          <p>
            <strong>Current mode:</strong> {isStatic ? 'Static (Cloudflare Pages)' : 'Dynamic (Development/SSR)'}
          </p>
          <p className="mt-2">
            <strong>Features available in static mode:</strong>
          </p>
          <ul className="list-disc pl-6 mt-1">
            <li>Sample viewing with demo data</li>
            <li>Map visualization with demo data</li>
            <li>All static content and pages</li>
          </ul>
          <p className="mt-2">
            <strong>Features requiring dynamic mode:</strong>
          </p>
          <ul className="list-disc pl-6 mt-1">
            <li>Live Supabase database connections</li>
            <li>Sample uploads and management</li>
            <li>User authentication</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
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

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl mb-4">Sample Management</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={isStatic || isUploading}
            />
            <label
              htmlFor="csv-upload"
              className="btn btn-primary cursor-pointer flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faUpload} />
              Upload CSV
            </label>
          </div>

          <button
            onClick={loadBuiltInSamples}
            disabled={isStatic || isUploading}
            className="btn btn-primary flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faTable} />
            Load Built-in Samples
          </button>

          <button
            onClick={deleteSamples}
            disabled={isStatic || isDeleting || isUploading}
            className="btn btn-danger flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete All Samples
          </button>
        </div>
      </div>
    </main>
  );
} 