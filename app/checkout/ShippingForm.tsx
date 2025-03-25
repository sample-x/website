'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ShippingFormProps {
  onSubmit: (shippingData: ShippingData) => void;
  isLoading: boolean;
}

export interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  shippingMethod: 'standard' | 'express' | 'priority';
  shippingNotes: string;
}

export default function ShippingForm({ onSubmit, isLoading }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingData>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    shippingMethod: 'standard',
    shippingNotes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingData, string>> = {};
    
    // Basic validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State/Province is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP/Postal code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear the error for this field when user types
    if (errors[name as keyof ShippingData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const shippingMethods = [
    { id: 'standard', name: 'Standard Shipping', price: 8.99, duration: '5-7 business days' },
    { id: 'express', name: 'Express Shipping', price: 14.99, duration: '2-3 business days' },
    { id: 'priority', name: 'Priority Shipping', price: 24.99, duration: 'Next business day' },
  ];

  return (
    <form onSubmit={handleSubmit} className="shipping-form">
      <h2>Shipping Information</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={errors.firstName ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={errors.lastName ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
          disabled={isLoading}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="address">Street Address *</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={errors.address ? 'error' : ''}
          disabled={isLoading}
        />
        {errors.address && <span className="error-message">{errors.address}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={errors.city ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="state">State/Province *</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={errors.state ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.state && <span className="error-message">{errors.state}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="zipCode">ZIP/Postal Code *</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className={errors.zipCode ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="country">Country *</label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          disabled={isLoading}
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
        {shippingMethods.map(method => (
          <div key={method.id} className="shipping-option">
            <input
              type="radio"
              id={`shipping-${method.id}`}
              name="shippingMethod"
              value={method.id}
              checked={formData.shippingMethod === method.id}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor={`shipping-${method.id}`} className="shipping-label">
              <div className="shipping-name">{method.name}</div>
              <div className="shipping-details">
                <span className="shipping-price">${method.price.toFixed(2)}</span>
                <span className="shipping-duration">{method.duration}</span>
              </div>
            </label>
          </div>
        ))}
      </div>
      
      <div className="form-group">
        <label htmlFor="shippingNotes">Special Instructions (Optional)</label>
        <textarea
          id="shippingNotes"
          name="shippingNotes"
          value={formData.shippingNotes}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Add any special instructions for delivery"
        ></textarea>
      </div>
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="submit-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  );
} 