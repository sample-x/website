'use client';

import { useState } from 'react';
import { loadSamples } from '@/utils/loadSamples';

export default function TestSamplesPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; error?: any } | null>(null);

    const handleLoadSamples = async () => {
        setLoading(true);
        try {
            const result = await loadSamples();
            setResult(result);
            console.log('Load samples result:', result);
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
                            Samples loaded successfully!
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