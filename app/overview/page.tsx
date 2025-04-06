'use client';

import React from 'react';

export default function OverviewPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Overview</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Platform Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Samples</p>
            <p className="text-3xl font-bold">1,245</p>
            <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Active Users</p>
            <p className="text-3xl font-bold">347</p>
            <p className="text-xs text-gray-500 mt-1">+8% from last month</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Exchanges</p>
            <p className="text-3xl font-bold">89</p>
            <p className="text-xs text-gray-500 mt-1">+15% from last month</p>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-4">Sample Distribution</h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <p className="text-gray-600 mb-4">Distribution of samples by type:</p>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Bacterial</span>
                <span className="text-sm font-medium">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Viral</span>
                <span className="text-sm font-medium">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Cell Line</span>
                <span className="text-sm font-medium">18%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Environmental</span>
                <span className="text-sm font-medium">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Other</span>
                <span className="text-sm font-medium">7%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: '7%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-4">Platform Updates</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="font-semibold">New Filtering Options</p>
            <p className="text-sm text-gray-600">Added advanced filtering for samples based on collection date and storage conditions.</p>
            <p className="text-xs text-gray-400 mt-1">June 15, 2023</p>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="font-semibold">Improved Map Visualization</p>
            <p className="text-sm text-gray-600">Enhanced the map with better visual indicators and filtering capabilities.</p>
            <p className="text-xs text-gray-400 mt-1">May 28, 2023</p>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="font-semibold">API Access</p>
            <p className="text-sm text-gray-600">Released the beta version of our API for developers and research partners.</p>
            <p className="text-xs text-gray-400 mt-1">April 10, 2023</p>
          </div>
        </div>
      </div>
    </main>
  );
} 