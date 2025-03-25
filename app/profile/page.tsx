'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../context/SupabaseProvider';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

// Interface for the raw order data from Supabase
interface RawOrder {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  user_id: string;
  [key: string]: any; // For any additional fields
}

// Interface for the order items from Supabase
interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  samples?: {
    id: string;
    name: string;
    type: string;
    location: string;
  };
  [key: string]: any; // For any additional fields
}

export default function ProfilePage() {
  const { user, signOut } = useSupabase();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/login?redirect=/profile');
      return;
    }

    // Fetch user's orders
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        // Get all orders for the user
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          throw ordersError;
        }
        
        // Get order items for each order
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order: RawOrder) => {
            const { data: orderItems, error: itemsError } = await supabase
              .from('order_items')
              .select(`
                id,
                price,
                quantity,
                samples (
                  id,
                  name,
                  type,
                  location
                )
              `)
              .eq('order_id', order.id);
            
            if (itemsError) {
              console.error('Error fetching order items:', itemsError);
              return {
                ...order,
                items: [],
              };
            }
            
            return {
              ...order,
              items: orderItems.map((item: OrderItem) => ({
                id: item.id,
                name: item.samples?.name || 'Unknown Sample',
                price: item.price,
                quantity: item.quantity,
              })),
            };
          })
        );
        
        setOrders(ordersWithItems);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [user, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Your Profile</h1>
        <button onClick={handleSignOut} className="btn btn-outline">
          Sign Out
        </button>
      </div>
      
      <div className="profile-content">
        <div className="profile-section">
          <h2>Account Information</h2>
          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Member Since:</span>
              <span className="detail-value">
                {new Date(user.created_at || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="profile-section">
          <h2>Your Orders</h2>
          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <p>You haven't placed any orders yet.</p>
              <button 
                onClick={() => router.push('/samples')}
                className="btn btn-primary"
              >
                Browse Samples
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{order.id.slice(0, 8)}</h3>
                      <p className="order-date">
                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                      <span className="order-total">${order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="order-items">
                    <h4>Items</h4>
                    <ul>
                      {order.items.map((item) => (
                        <li key={item.id} className="order-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">${item.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 