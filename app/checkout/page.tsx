'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from 'react-toastify';
import './checkout.css';
import { Sample } from '@/types/sample';

export default function CheckoutPage() {
  const supabase = useSupabaseClient();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  const router = useRouter();
  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Mock price if not available in the sample data
  const price = sample?.price || 299.99;
  
  useEffect(() => {
    async function fetchSample() {
      if (!id) {
        setError('No sample ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login?redirect=/checkout?id=' + id);
          return;
        }

        const { data, error } = await supabase
          .from('samples')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) {
          setError('Sample not found');
        } else {
          setSample(data);
        }
      } catch (err) {
        console.error('Error fetching sample:', err);
        setError('Error loading sample details');
      } finally {
        setLoading(false);
      }
    }

    fetchSample();
  }, [id, router, supabase]);
  
  const handleCheckout = async () => {
    if (!sample) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/checkout?id=' + id);
        return;
      }

      // Add your checkout logic here
      toast.success('Checkout successful!');
      router.push('/orders');
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Checkout failed. Please try again.');
    }
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
            disabled={!sample.quantity || sample.quantity <= 0}
          >
            {sample.quantity && sample.quantity > 0 ? 'Proceed to Payment' : 'Out of Stock'}
          </button>
          
          <Link href="/samples" className="btn btn-secondary btn-back">
            Back to Samples
          </Link>
        </div>
      </div>
    </div>
  );
} 