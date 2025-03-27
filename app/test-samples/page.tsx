'use client';

import { useState, useEffect } from 'react';
import { loadSamples } from '@/utils/loadSamples';
import { Sample } from '@/types/sample';
import { isStaticExport } from '@/app/lib/staticData';

export default function TestSamplesPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; data?: Sample[]; error?: any } | null>(null);
    const [isStatic, setIsStatic] = useState(false);

    useEffect(() => {
        // Check if we're in static mode
        setIsStatic(isStaticExport());
    }, []);

    const handleLoadSamples = async () => {
        setLoading(true);
        try {
            const samples = await loadSamples();
            setResult({ success: true, data: samples });
            console.log('Load samples result:', samples);
        } catch (error) {
            console.error('Error in handleLoadSamples:', error);
            setResult({ success: false, error: error instanceof Error ? error.message : String(error) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Test Samples Loading</h1>
            
            {isStatic && (
                <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded">
                    <p className="font-bold">Running in Static Mode</p>
                    <p>This page will load sample data from static JSON files. No Supabase connection available.</p>
                </div>
            )}
            
            <button
                onClick={handleLoadSamples}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {loading ? 'Loading...' : 'Load Samples'}
            </button>

            {result && (
                <div className="mt-4 p-4 rounded border">
                    {result.success ? (
                        <div className="text-green-600">
                            <p className="font-bold mb-2">Samples loaded successfully!</p>
                            <p>Total samples loaded: {result.data?.length || 0}</p>
                            <div className="mt-4 max-h-96 overflow-auto">
                                <pre className="bg-gray-50 p-4 rounded">
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div className="text-red-600">
                            <p className="font-bold mb-2">Error loading samples:</p>
                            <pre className="bg-red-50 p-4 rounded overflow-auto">
                                {typeof result.error === 'object' 
                                    ? JSON.stringify(result.error, null, 2) 
                                    : result.error}
                            </pre>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8">
                <p className="text-sm text-gray-600">
                    Check the browser console for detailed progress logs.
                </p>
            </div>
        </div>
    );
} 