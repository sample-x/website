'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './checkout.css'

interface Sample {
  id: string | number;
  name: string;
  type?: string;
  category?: string;
  price?: number;
  description: string;
}

export default function CheckoutClient({ id }: { id: string }) {
  const router = useRouter()
  const [sample, setSample] = useState<Sample | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Mock price if not available in the sample data
  const price = sample?.price || 299.99
  
  useEffect(() => {
    async function fetchSampleDetails() {
      // Check if id exists
      if (!id) {
        setError('Sample ID is missing');
        setLoading(false);
        return;
      }
      
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