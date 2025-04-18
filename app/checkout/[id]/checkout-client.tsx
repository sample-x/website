'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './checkout.css'
import { isStaticExport, getStaticSampleById } from '@/app/lib/staticData'

interface Sample {
  id: string | number;
  name: string;
  type?: string;
  category?: string;
  price?: number;
  description: string;
  quantity?: number;
  location?: string;
  coordinates?: string;
  collectionDate?: string;
  storageCondition?: string;
  availability?: string;
  inStock?: boolean;
  created_at?: string;
  updated_at?: string;
  latitude?: number;
  longitude?: number;
  hash?: string;
}

export default function CheckoutClient({ id }: { id: string }) {
  const router = useRouter()
  const [sample, setSample] = useState<Sample | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isStatic, setIsStatic] = useState(false)
  
  // Mock price if not available in the sample data
  const price = sample?.price || 299.99
  
  useEffect(() => {
    // Check if we're in static mode
    const staticMode = isStaticExport()
    setIsStatic(staticMode)
    
    async function fetchSampleDetails() {
      // Check if id exists
      if (!id) {
        setError('Sample ID is missing');
        setLoading(false);
        return;
      }
      
      // In static mode, use the static sample data
      if (staticMode) {
        const staticSample = getStaticSampleById(id);
        if (staticSample) {
          const formData = {
            id: staticSample.id,
            name: staticSample.name,
            type: staticSample.type,
            price: staticSample.price,
            quantity: staticSample.quantity,
            description: staticSample.description || '',
            location: staticSample.location,
            latitude: staticSample.latitude,
            longitude: staticSample.longitude,
            collection_date: staticSample.collection_date,
            storage_condition: staticSample.storage_condition,
            hash: staticSample.hash,
            created_at: staticSample.created_at,
            updated_at: staticSample.updated_at,
            inStock: staticSample.quantity > 0
          };
          setSample(formData);
          setLoading(false);
        } else {
          setError('Sample not found in static data');
          setLoading(false);
        }
        return;
      }
      
      // Dynamic mode - fetch from API
      try {
        // Use relative path to the backend API
        let response = await fetch(`/api/samples/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sample: ${response.status}`);
        }
        
        const data = await response.json();
        setSample(data);
      } catch (error) {
        console.error('Error fetching sample:', error);
        setError('Failed to load sample details. Please try again later.');
        
        // Fallback to local data
        try {
          let response = await fetch(`/data/samples.json`);
          
          if (response.ok) {
            const data = await response.json();
            const foundSample = data.find((s: Sample) => s.id.toString() === id);
            
            if (foundSample) {
              setSample(foundSample);
            } else {
              setError('Sample not found');
            }
          }
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchSampleDetails();
  }, [id]);
  
  const handleCheckout = async () => {
    // Check if id exists
    if (!id) {
      setError('Sample ID is missing');
      return;
    }

    // In static mode, just navigate to success page with mock data
    if (isStatic) {
      router.push(`/checkout/success?id=${id}&orderId=static-demo-order-${Date.now()}`);
      return;
    }

    try {
      // Use relative path to the API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sampleId: id }),
      });
      
      if (!response.ok) {
        throw new Error('Checkout failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to success page
        router.push(`/checkout/success?id=${id}&orderId=${data.orderId}`);
      } else {
        setError(data.message || 'Payment processing failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError('Payment processing failed. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading-spinner"></div>
        <p>Loading sample details...</p>
      </div>
    )
  }
  
  if (error || !sample) {
    return (
      <div className="checkout-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error || 'Sample not found'}</p>
          <Link href="/samples" className="btn btn-primary">
            Back to Samples
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="checkout-container">
      {isStatic && (
        <div className="static-mode-notice">
          <p>Running in demo mode. Checkout functionality is simulated.</p>
        </div>
      )}
      
      <div className="checkout-header">
        <h1>Checkout</h1>
      </div>
      
      <div className="checkout-content">
        <div className="sample-details">
          <h2>{sample.name}</h2>
          <p className="sample-type">
            <span className={`category-badge ${sample.type}`}>
              {sample.type}
            </span>
          </p>
          <p className="sample-description">{sample.description}</p>
        </div>
        
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="summary-item">
            <span>Sample Price</span>
            <span>${price.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Shipping</span>
            <span>$25.00</span>
          </div>
          <div className="summary-item">
            <span>Tax</span>
            <span>${(price * 0.08).toFixed(2)}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>${(price + 25 + price * 0.08).toFixed(2)}</span>
          </div>
          
          <button 
            className="btn btn-checkout"
            onClick={handleCheckout}
          >
            Proceed to Payment
          </button>
          
          <Link href="/samples" className="btn btn-secondary btn-back">
            Back to Samples
          </Link>
        </div>
      </div>
    </div>
  )
} 