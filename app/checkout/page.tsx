'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from 'react-toastify';
import './checkout.css';
import { Sample } from '@/types/sample';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ShippingData } from './ShippingForm';

export default function CheckoutPage() {
  const supabase = useSupabaseClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { items, total, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Review, 2: Shipping/Billing, 3: Payment
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [shippingInfo, setShippingInfo] = useState<ShippingData | null>(null);
  const [isTaxExempt, setIsTaxExempt] = useState(false);
  
  // Calculate order totals
  const subtotal = total;
  const shippingMethod = shippingInfo?.shippingMethod || 'standard';
  const shippingCost = shippingMethod === 'standard' ? 8.99 : 
                      shippingMethod === 'express' ? 14.99 : 24.99;
  
  // Calculate tax based on state unless tax exempt
  const taxRate = !isTaxExempt && shippingInfo?.state ? 
    (["CA", "New York", "NY", "Texas", "TX", "Florida", "FL"].includes(shippingInfo.state) ? 0.085 : 0.06) 
    : 0;
  const taxAmount = subtotal * taxRate;
  const orderTotal = subtotal + shippingCost + taxAmount;
  
  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    
    // If cart is empty, redirect to cart page
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    // Pre-fill shipping info from profile if available
    if (profile && !shippingInfo) {
      setShippingInfo({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: user.email || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zip_code || '',
        country: profile.country || 'United States',
        shippingMethod: 'standard',
        shippingNotes: ''
      });
    }
  }, [user, profile, router, items, shippingInfo]);
  
  const handleShippingSubmit = (data: ShippingData) => {
    setShippingInfo(data);
    setStep(3); // Move to payment step
  };
  
  const handleTaxExemptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTaxExempt(e.target.checked);
  };
  
  const handlePlaceOrder = async () => {
    if (!user || !shippingInfo) return;
    
    setLoading(true);
    
    try {
      // Generate random order number
      const randomOrderNumber = Math.floor(100000 + Math.random() * 900000).toString();
      setOrderNumber(randomOrderNumber);
      
      // Create order in database
      try {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            order_number: randomOrderNumber,
            total_amount: orderTotal,
            shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`,
            shipping_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            shipping_email: shippingInfo.email,
            shipping_method: shippingInfo.shippingMethod,
            status: 'pending',
            tax_amount: taxAmount,
            shipping_amount: shippingCost,
            is_tax_exempt: isTaxExempt,
            notes: shippingInfo.shippingNotes || ''
          })
          .select()
          .single();
        
        if (orderError) throw orderError;
        
        if (order) {
          try {
            // Create order items
            const orderItems = items.map(item => ({
              order_id: order.id,
              sample_id: item.id,
              quantity: item.quantity_selected,
              price: item.price,
              total: item.price * item.quantity_selected
            }));
            
            const { error: itemsError } = await supabase
              .from('order_items')
              .insert(orderItems);
            
            if (itemsError) {
              console.error('Error creating order items:', itemsError);
              // Delete the order if items failed to insert
              await supabase.from('orders').delete().eq('id', order.id);
              throw new Error('Failed to create order items');
            }
          } catch (itemError) {
            console.error('Error with order items:', itemError);
            throw new Error('Failed to process order items');
          }
          
          // If the address is new, update the user profile (optional, won't block checkout)
          if (profile && (
            profile.address !== shippingInfo.address ||
            profile.city !== shippingInfo.city ||
            profile.state !== shippingInfo.state ||
            profile.zip_code !== shippingInfo.zipCode
          )) {
            try {
              await supabase
                .from('user_profiles')
                .update({
                  address: shippingInfo.address,
                  city: shippingInfo.city,
                  state: shippingInfo.state,
                  zip_code: shippingInfo.zipCode
                })
                .eq('id', user.id);
            } catch (profileError) {
              console.error('Error updating profile:', profileError);
              // Continue with checkout even if profile update fails
            }
          }
          
          // Log instead of sending email for now
          console.log('Order confirmation would be sent to:', user.email);
          console.log('Order number:', randomOrderNumber);
          
          // If we got this far, the order was created successfully
          // Clear cart first before redirecting
          clearCart();
          setOrderComplete(true);
          toast.success('Order placed successfully!');
          
          // Redirect to success page
          router.push(`/checkout/success?order=${randomOrderNumber}`);
        } else {
          throw new Error('Failed to create order');
        }
      } catch (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error('Failed to create order. Please try again.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred during checkout');
      toast.error('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (error) {
    return (
      <div className="checkout-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Link href="/cart" className="btn btn-primary">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Review</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Shipping</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Payment</div>
        </div>
      </div>
      
      {step === 1 && (
        <div className="checkout-content">
          <div className="checkout-items">
            <h2>Order Items</h2>
            {items.map(item => (
              <div key={item.id} className="checkout-item">
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-type">
                    <span className={`category-badge ${item.type}`}>
                      {item.type}
                    </span>
                  </p>
                  <p className="item-quantity">Quantity: {item.quantity_selected}</p>
                </div>
                <div className="item-price">
                  ${(item.price * item.quantity_selected).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="summary-item">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Shipping</span>
              <span>Calculated at next step</span>
            </div>
            <div className="summary-item">
              <span>Tax</span>
              <span>Calculated at next step</span>
            </div>
            <div className="summary-total">
              <span>Estimated Total</span>
              <span>${subtotal.toFixed(2)}+</span>
            </div>
            
            <button 
              className="btn btn-checkout"
              onClick={() => setStep(2)}
              disabled={loading}
            >
              Continue to Shipping
            </button>
            
            <Link href="/cart" className="btn btn-secondary btn-back">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Cart
            </Link>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <div className="checkout-content">
          <div className="shipping-section">
            <h2>Shipping Information</h2>
            <div className="checkout-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={shippingInfo?.firstName || ''}
                    onChange={e => setShippingInfo({...shippingInfo!, firstName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={shippingInfo?.lastName || ''}
                    onChange={e => setShippingInfo({...shippingInfo!, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={shippingInfo?.email || ''}
                  onChange={e => setShippingInfo({...shippingInfo!, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Street Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo?.address || ''}
                  onChange={e => setShippingInfo({...shippingInfo!, address: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo?.city || ''}
                    onChange={e => setShippingInfo({...shippingInfo!, city: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="state">State/Province *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingInfo?.state || ''}
                    onChange={e => setShippingInfo({...shippingInfo!, state: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP/Postal Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={shippingInfo?.zipCode || ''}
                    onChange={e => setShippingInfo({...shippingInfo!, zipCode: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <select
                  id="country"
                  name="country"
                  value={shippingInfo?.country || 'United States'}
                  onChange={e => setShippingInfo({...shippingInfo!, country: e.target.value})}
                  required
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                  <option value="France">France</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group shipping-options">
                <label>Shipping Method *</label>
                <div className="shipping-option">
                  <input
                    type="radio"
                    id="shipping-standard"
                    name="shippingMethod"
                    value="standard"
                    checked={shippingInfo?.shippingMethod === 'standard'}
                    onChange={() => setShippingInfo({...shippingInfo!, shippingMethod: 'standard'})}
                  />
                  <label htmlFor="shipping-standard" className="shipping-label">
                    <div className="shipping-name">Standard Shipping</div>
                    <div className="shipping-details">
                      <span className="shipping-price">$8.99</span>
                      <span className="shipping-duration">5-7 business days</span>
                    </div>
                  </label>
                </div>
                
                <div className="shipping-option">
                  <input
                    type="radio"
                    id="shipping-express"
                    name="shippingMethod"
                    value="express"
                    checked={shippingInfo?.shippingMethod === 'express'}
                    onChange={() => setShippingInfo({...shippingInfo!, shippingMethod: 'express'})}
                  />
                  <label htmlFor="shipping-express" className="shipping-label">
                    <div className="shipping-name">Express Shipping</div>
                    <div className="shipping-details">
                      <span className="shipping-price">$14.99</span>
                      <span className="shipping-duration">2-3 business days</span>
                    </div>
                  </label>
                </div>
                
                <div className="shipping-option">
                  <input
                    type="radio"
                    id="shipping-priority"
                    name="shippingMethod"
                    value="priority"
                    checked={shippingInfo?.shippingMethod === 'priority'}
                    onChange={() => setShippingInfo({...shippingInfo!, shippingMethod: 'priority'})}
                  />
                  <label htmlFor="shipping-priority" className="shipping-label">
                    <div className="shipping-name">Priority Shipping</div>
                    <div className="shipping-details">
                      <span className="shipping-price">$24.99</span>
                      <span className="shipping-duration">Next business day</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="shippingNotes">Special Instructions (Optional)</label>
                <textarea
                  id="shippingNotes"
                  name="shippingNotes"
                  value={shippingInfo?.shippingNotes || ''}
                  onChange={e => setShippingInfo({...shippingInfo!, shippingNotes: e.target.value})}
                  placeholder="Add any special instructions for delivery"
                ></textarea>
              </div>
              
              <div className="form-group tax-exempt">
                <input
                  type="checkbox"
                  id="taxExempt"
                  checked={isTaxExempt}
                  onChange={handleTaxExemptChange}
                />
                <label htmlFor="taxExempt">Tax Exempt (for academic and research institutions)</label>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-back"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button 
                  type="button" 
                  className="btn btn-checkout" 
                  onClick={() => setStep(3)}
                  disabled={!shippingInfo?.firstName || !shippingInfo?.lastName || !shippingInfo?.email || 
                            !shippingInfo?.address || !shippingInfo?.city || !shippingInfo?.state || 
                            !shippingInfo?.zipCode}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="checkout-content">
          <div className="payment-section">
            <h2>Payment Method</h2>
            <div className="payment-options">
              <div className="payment-option">
                <input type="radio" id="payment-invoice" name="paymentMethod" value="invoice" checked />
                <label htmlFor="payment-invoice">Pay by Invoice (Academic Institutions Only)</label>
                <p className="payment-description">
                  For academic and research institutions. An invoice will be emailed to you after order placement.
                </p>
              </div>
            </div>
            
            <div className="order-review">
              <h3>Order Review</h3>
              
              <div className="review-section">
                <h4>Shipping Information</h4>
                <p>
                  {shippingInfo?.firstName} {shippingInfo?.lastName}<br />
                  {shippingInfo?.address}<br />
                  {shippingInfo?.city}, {shippingInfo?.state} {shippingInfo?.zipCode}<br />
                  {shippingInfo?.country}<br />
                  {shippingInfo?.email}
                </p>
                <p className="shipping-method">
                  <strong>Shipping Method:</strong> {shippingInfo?.shippingMethod === 'standard' ? 'Standard Shipping (5-7 business days)' : 
                                                  shippingInfo?.shippingMethod === 'express' ? 'Express Shipping (2-3 business days)' : 
                                                  'Priority Shipping (Next business day)'}
                </p>
              </div>
              
              <div className="review-section">
                <h4>Order Summary</h4>
                <div className="summary-items">
                  {items.map(item => (
                    <div key={item.id} className="summary-line-item">
                      <span>{item.name} × {item.quantity_selected}</span>
                      <span>${(item.price * item.quantity_selected).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="summary-item">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Tax {isTaxExempt ? '(Tax Exempt)' : ''}</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-back"
                onClick={() => setStep(2)}
              >
                Back to Shipping
              </button>
              <button 
                type="button" 
                className="btn btn-submit" 
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 