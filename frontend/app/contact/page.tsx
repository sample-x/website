'use client'

import { useState, useEffect } from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import './contact.css'

export default function ContactPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: isDemo ? 'Demo Request' : '',
    message: isDemo ? 'I would like to schedule a demo of Sample Exchange.' : '',
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      
      // In a real app, you would send the data to your backend
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      // if (!response.ok) throw new Error('Failed to submit form')
      
      setSubmitSuccess(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    } catch (error) {
      setSubmitError('Failed to submit form. Please try again.')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  function ContactForm() {
    return (
      <main>
        <section className="contact-hero">
          <div className="container">
            <h1>{isDemo ? 'Request a Demo' : 'Contact Us'}</h1>
            <p>{isDemo 
              ? 'See Sample Exchange in action with a personalized demo' 
              : 'Have questions or feedback? We\'d love to hear from you!'}
            </p>
          </div>
        </section>
        
        <section className="contact-form-section">
          <div className="container">
            <div className="contact-grid">
              <div className="contact-info">
                <h2>Get in Touch</h2>
                <p>Our team is here to help with any questions about our platform.</p>
                
                <div className="contact-details">
                  <div className="contact-item">
                    <i className="icon-location"></i>
                    <div>
                      <h3>Address</h3>
                      <p>655 Oak Grove Ave. #1417<br />Menlo Park, California 94025</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <i className="icon-email"></i>
                    <div>
                      <h3>Email</h3>
                      <p>info (at) sample.exchange</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <i className="icon-phone"></i>
                    <div>
                      <h3>Phone</h3>
                      <p>415-570-9067</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="contact-form-container">
                {submitSuccess ? (
                  <div className="success-message">
                    <h2>Thank you!</h2>
                    <p>Your message has been sent successfully. We'll get back to you soon.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setSubmitSuccess(false)}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit}>
                    <h2>{isDemo ? 'Schedule Your Demo' : 'Send Us a Message'}</h2>
                    
                    {submitError && <div className="error-message">{submitError}</div>}
                    
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="message">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <div className="contact-page">
      <h1>Contact Us</h1>
      <Suspense fallback={<div>Loading form...</div>}>
        <ContactForm />
      </Suspense>
    </div>
  )
} 