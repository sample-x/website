'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import './success.css'

interface Sample {
  id: string | number;
  name: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const id = searchParams?.get('id')
  const [orderNumber, setOrderNumber] = useState('')
  
  useEffect(() => {
    // Generate a random order number
    const randomOrderNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    setOrderNumber(randomOrderNumber)
  }, [])
  
  return (
    <div className="checkout-container">
      <div className="success-message">
        <div className="success-icon">✓</div>
        <h1>Order Successful!</h1>
        <p>Thank you for your purchase. Your order has been received.</p>
        <div className="order-details">
          <p><strong>Order Number:</strong> #{orderNumber}</p>
          <p><strong>Sample ID:</strong> {id}</p>
          <p>A confirmation email has been sent to your registered email address.</p>
        </div>
        <div className="next-steps">
          <h2>What's Next?</h2>
          <p>Your sample will be prepared for shipping within 1-2 business days.</p>
          <p>You can track your order status in your account dashboard.</p>
        </div>
        <div className="action-buttons">
          <Link href="/samples" className="btn btn-primary">
            Browse More Samples
          </Link>
          <Link href="/dashboard" className="btn btn-secondary">
            View Your Orders
          </Link>
        </div>
      </div>
    </div>
  )
} 