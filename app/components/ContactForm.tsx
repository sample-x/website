'use client'

import { useState } from 'react'

interface ContactFormProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function ContactForm({ title, subtitle, compact = false }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (error) {
      setSubmitError('There was an error sending your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className={`contact-form ${compact ? 'compact' : ''}`}>
      {title && <h3 className="text-white text-2xl mb-4">{title}</h3>}
      {subtitle && <p className="form-subtitle text-white mb-6">{subtitle}</p>}
      
      {submitSuccess && (
        <div className="success-message">
          Thank you for your message! We'll get back to you soon.
        </div>
      )}
      
      {submitError && (
        <div className="error-message">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="text-gray-700 font-medium mb-2 block">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="text-gray-800 bg-white w-full p-3 rounded-md"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email" className="text-gray-700 font-medium mb-2 block">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="text-gray-800 bg-white w-full p-3 rounded-md"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subject" className="text-gray-700 font-medium mb-2 block">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="text-gray-800 bg-white w-full p-3 rounded-md"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="message" className="text-gray-700 font-medium mb-2 block">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            required
            className="text-gray-800 bg-white w-full p-3 rounded-md"
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
