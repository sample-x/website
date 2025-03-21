'use client'

import { useState, useEffect } from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import './success.css'

interface Sample {
  id: string | number;
  name: string;
}

export default function CheckoutSuccessPage() {
  // Move code that uses useSearchParams to a client component
  function SuccessDetails() {
    const searchParams = useSearchParams()
    const sampleId = searchParams.get('id')
    const [sample, setSample] = useState<Sample | null>(null)
    
    useEffect(() => {
      async function fetchSampleDetails() {
        if (!sampleId) return
        
        try {
          let response = await fetch(`/data/samples.json`)
          
          if (!response.ok) {
            throw new Error(`Failed to fetch sample: ${response.status}`)
          }
          
          const data = await response.json()
          const foundSample = data.find((s: Sample) => s.id.toString() === sampleId)
          
          if (foundSample) {
            setSample(foundSample)
          }
        } catch (error) {
          console.error('Error fetching sample:', error)
        }
      }
      
      fetchSampleDetails()
    }, [sampleId])
    
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Payment Successful!</h1>
          
          {sample ? (
            <p>Thank you for purchasing <strong>{sample.name}</strong>.</p>
          ) : (
            <p>Thank you for your purchase.</p>
          )}
          
          <p>Your order has been processed and will be shipped soon.</p>
          <p>A confirmation email has been sent to your registered email address.</p>
          
          <div className="success-actions">
            <Link href="/samples" className="btn btn-primary">
              Browse More Samples
            </Link>
            <Link href="/" className="btn btn-secondary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-success">
      <h1>Order Complete</h1>
      <Suspense fallback={<div>Loading order details...</div>}>
        <SuccessDetails />
      </Suspense>
    </div>
  )
} 