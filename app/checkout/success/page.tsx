'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useAuth } from '@/app/auth/AuthProvider'
import './success.css'

interface Order {
  id: string;
  order_number: string;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  sample_id: string;
  quantity: number;
  price: number;
  total: number;
  sample: {
    name: string;
    type: string;
  };
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get('order');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const supabase = useSupabaseClient();
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderNumber || !user) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', orderNumber)
          .eq('user_id', user.id)
          .single();
        
        if (orderError) throw orderError;
        if (!orderData) {
          setError('Order not found');
          setLoading(false);
          return;
        }
        
        setOrder(orderData as Order);
        
        // Fetch order items with sample details
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            sample:sample_id (
              name,
              type
            )
          `)
          .eq('order_id', orderData.id);
        
        if (itemsError) throw itemsError;
        setOrderItems(itemsData as OrderItem[]);
        
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Error loading order details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrderDetails();
  }, [orderNumber, supabase, user]);
  
  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="checkout-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error || 'Order information not available'}</p>
          <Link href="/samples" className="btn btn-primary">
            Browse Samples
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="checkout-container">
      <div className="success-message">
        <div className="success-icon">✓</div>
        <h1>Order Successful!</h1>
        <p>Thank you for your purchase. Your order has been received.</p>
        
        <div className="order-details">
          <h2>Order Information</h2>
          <p><strong>Order Number:</strong> #{order.order_number}</p>
          <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span className="status-badge">{order.status}</span></p>
        </div>
        
        <div className="shipping-info">
          <h2>Shipping Information</h2>
          <p><strong>Recipient:</strong> {order.shipping_name}</p>
          <p><strong>Address:</strong> {order.shipping_address}</p>
          <p><strong>Email:</strong> {order.shipping_email}</p>
        </div>
        
        <div className="order-items">
          <h2>Order Items</h2>
          <div className="items-list">
            {orderItems.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-info">
                  <p className="item-name">{item.sample?.name}</p>
                  <p className="item-type">{item.sample?.type}</p>
                </div>
                <div className="item-quantity">
                  Qty: {item.quantity}
                </div>
                <div className="item-price">
                  ${item.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="order-total">
            <p><strong>Total:</strong> ${order.total_amount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="next-steps">
          <h2>What's Next?</h2>
          <p>Your samples will be prepared for shipping within 1-2 business days.</p>
          <p>A confirmation email has been sent to your registered email address.</p>
          <p>The sample owners have been notified and will prepare your order for shipping.</p>
        </div>
        
        <div className="action-buttons">
          <Link href="/samples" className="btn btn-primary">
            Browse More Samples
          </Link>
          <Link href="/orders" className="btn btn-secondary">
            View Your Orders
          </Link>
        </div>
      </div>
    </div>
  );
} 