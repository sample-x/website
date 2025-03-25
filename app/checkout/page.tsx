'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '../context/SupabaseProvider';
import { toast } from 'react-toastify';
import './checkout.css';

interface Sample {
  id: string | number;
  name: string;
  type?: string;
  category?: string;
  price?: number;
  description: string;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  const router = useRouter();
  const { user } = useSupabase();
  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Mock price if not available in the sample data
  const price = sample?.price || 299.99;
  
  useEffect(() => {
    async function fetchSampleDetails() {
      // Check if id exists
      if (!id) {
        setError('Sample ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        // For static export, use local data
        const response = await fetch('/data/samples.json');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sample data: ${response.status}`);
        }
        
        const data = await response.json();
        const foundSample = data.find((s: Sample) => s.id.toString() === id);
        
        if (foundSample) {
          setSample(foundSample);
        } else {
          setError('Sample not found');
        }
      } catch (error) {
        console.error('Error fetching sample:', error);
        setError('Failed to load sample details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSampleDetails();
  }, [id]);
  
  const handleCheckout = async () => {
    // For static export, just show a success message
    router.push(`/checkout/success?id=${id}`);
  };
  
  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading-spinner"></div>
        <p>Loading sample details...</p>
      </div>
    );
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
    );
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
            <span className={`category-badge ${sample.type || sample.category}`}>
              {sample.type || sample.category}
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
  );
} 