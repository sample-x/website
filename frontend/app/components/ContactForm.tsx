'use client'

import { useState, FormEvent } from 'react'
import '../contact/contact.css'

interface ContactFormProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function ContactForm({ 
  title = "Send Us a Message", 
  subtitle,
  compact = false 
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  const [formStatus, setFormStatus] = useState<{
    submitted: boolean;
    success: boolean;
    message: string;
  }>({
    submitted: false,
    success: false,
    message: ''
  })
  
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  }>({})
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }
  
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      // In a real implementation, this would send data to a backend API
      // For now, we'll just simulate a successful submission
      console.log('Form data submitted:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message
      setFormStatus({
        submitted: true,
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
      })
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      setFormStatus({
        submitted: true,
        success: false,
        message: 'There was an error submitting your message. Please try again later.'
      })
    }
  }
  
  return (
    <div className={`contact-form-container ${compact ? 'compact' : ''}`}>
      {title && <h2>{title}</h2>}
      {subtitle && <p className="form-subtitle">{subtitle}</p>}
      
      {formStatus.submitted && formStatus.success ? (
        <div className="form-success">
          <div className="success-icon">✓</div>
          <h3>Message Sent!</h3>
          <p>{formStatus.message}</p>
          <button 
            className="btn btn-primary"
            onClick={() => setFormStatus(prev => ({ ...prev, submitted: false }))}
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form className={`contact-form ${compact ? 'compact-form' : ''}`} onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={errors.subject ? 'error' : ''}
            />
            {errors.subject && <span className="error-message">{errors.subject}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Your Message</label>
            <textarea
              id="message"
              name="message"
              rows={compact ? 4 : 6}
              value={formData.message}
              onChange={handleChange}
              className={errors.message ? 'error' : ''}
            ></textarea>
            {errors.message && <span className="error-message">{errors.message}</span>}
          </div>
          
          <button type="submit" className="btn btn-primary">
            Send Message
          </button>
          
          {formStatus.submitted && !formStatus.success && (
            <div className="form-error">
              <p>{formStatus.message}</p>
            </div>
          )}
        </form>
      )}
    </div>
  )
} 