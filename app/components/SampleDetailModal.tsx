'use client'

import { useState } from 'react'
import { Sample } from '@/types/sample'
import { XMarkIcon, BeakerIcon, DocumentTextIcon, ShieldCheckIcon, ArrowDownOnSquareIcon } from '@heroicons/react/24/outline'

interface SampleDetailModalProps {
  isOpen: boolean
  onClose: () => void
  sample: Sample | null
  onAddToCart: (sample: Sample) => Promise<void>
  isStaticMode?: boolean
}

export default function SampleDetailModal({
  isOpen,
  onClose,
  sample,
  onAddToCart,
  isStaticMode
}: SampleDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedTab, setSelectedTab] = useState('details')

  if (!isOpen || !sample) return null

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (e) {
      return dateString
    }
  }

  // Calculate BSL level based on sample type (simplified logic)
  const getBSLLevel = (type?: string) => {
    if (!type) return '1'
    const typeLower = type.toLowerCase()
    
    if (typeLower.includes('viral') || typeLower.includes('pathogen')) return '2'
    if (typeLower.includes('bacterial')) return '1'
    if (typeLower.includes('cell line')) return '1'
    return '1'
  }

  const bslLevel = getBSLLevel(sample.type)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-800">{sample.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full max-h-[calc(90vh-70px)]">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 bg-gray-50 p-6 border-r overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-2">Sample ID</h3>
              <p className="text-gray-700 text-lg font-mono">{sample.id || 'N/A'}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-2">Price</h3>
              <p className="text-2xl font-bold text-gray-900">${sample.price?.toFixed(2) || 'N/A'}</p>
              <p className="text-sm text-gray-500 mt-1">
                Discounts may be available for educational institutions
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={(sample.quantity || 10)}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mr-2"
                />
                <button
                  onClick={() => sample && onAddToCart(sample)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-2">Shipping Info</h3>
              <p className="text-gray-700">
                Generally ships within 1-3 business days
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-2">Documentation</h3>
              <div className="space-y-2">
                <button className="flex items-center text-indigo-600 hover:text-indigo-800">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Product Sheet
                </button>
                <button className="flex items-center text-indigo-600 hover:text-indigo-800">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Safety Data Sheet
                </button>
                <button className="flex items-center text-indigo-600 hover:text-indigo-800">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Biosafety Level: {bslLevel}
                </button>
                <button className="flex items-center text-indigo-600 hover:text-indigo-800">
                  <ArrowDownOnSquareIcon className="h-5 w-5 mr-2" />
                  Download Certificate
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="w-full md:w-2/3 p-6 overflow-y-auto">
            {/* Tabs */}
            <div className="border-b mb-6">
              <nav className="flex -mb-px space-x-8">
                <button
                  onClick={() => setSelectedTab('details')}
                  className={`pb-4 border-b-2 font-medium text-sm ${
                    selectedTab === 'details'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setSelectedTab('storage')}
                  className={`pb-4 border-b-2 font-medium text-sm ${
                    selectedTab === 'storage'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Storage & Handling
                </button>
                <button
                  onClick={() => setSelectedTab('references')}
                  className={`pb-4 border-b-2 font-medium text-sm ${
                    selectedTab === 'references'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  References
                </button>
              </nav>
            </div>

            {/* Details tab */}
            {selectedTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">
                    {sample.description || 'No description available.'}
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-500 text-sm">Type</h4>
                      <p className="text-gray-800 mt-1">{sample.type || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-500 text-sm">Collection Date</h4>
                      <p className="text-gray-800 mt-1">{formatDate(sample.collection_date)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-500 text-sm">Location</h4>
                      <p className="text-gray-800 mt-1">{sample.location || 'N/A'}</p>
                    </div>
                    {sample.institution_name && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-500 text-sm">Institution</h4>
                        <p className="text-gray-800 mt-1">{sample.institution_name}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-500 text-sm">Biosafety Level</h4>
                      <p className="text-gray-800 mt-1">{bslLevel}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-500 text-sm">Coordinates</h4>
                      <p className="text-gray-800 mt-1">
                        {sample.latitude ? `${sample.latitude.toFixed(4)}, ${sample.longitude?.toFixed(4)}` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-500 text-sm">Available Quantity</h4>
                      <p className="text-gray-800 mt-1">{sample.quantity || 'Limited stock'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Storage & Handling tab */}
            {selectedTab === 'storage' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Storage Conditions</h3>
                  <p className="text-gray-700">
                    {sample.storage_condition || 'Standard laboratory storage conditions recommended.'}
                  </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <BeakerIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Storage Precautions</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Handle according to established biosafety practices. Follow all applicable regulations and guidelines.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Handling Instructions</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                    <li>Thaw sample according to enclosed instructions.</li>
                    <li>Avoid repeated freeze-thaw cycles to maintain viability.</li>
                    <li>Use appropriate personal protective equipment.</li>
                    <li>Follow institutional biosafety protocols for handling and disposal.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* References tab */}
            {selectedTab === 'references' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">References</h3>
                  {sample.references ? (
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {sample.references.map((ref, index) => (
                        <li key={index}>{ref}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">No references available for this sample.</p>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Resources</h3>
                  <div className="space-y-3">
                    <button className="block text-indigo-600 hover:text-indigo-800">
                      Standard operating procedures
                    </button>
                    <button className="block text-indigo-600 hover:text-indigo-800">
                      Sample handling guide
                    </button>
                    <button className="block text-indigo-600 hover:text-indigo-800">
                      Scientific publications using this sample
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 