'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ClientContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('general');
  const [submitted, setSubmitted] = useState(false);
  const searchParams = useSearchParams();
  
  // Use search params to pre-fill topic if provided
  useEffect(() => {
    const topicParam = searchParams?.get('topic');
    if (topicParam) {
      setTopic(topicParam);
    }
  }, [searchParams]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation and submission logic
    console.log('Submitting form:', { name, email, message, topic });
    
    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      setTopic('general');
    }, 1000);
  };
  
  return (
    <div className="contact-form">
      {submitted ? (
        <div className="success-message">
          <h2>Thank you for contacting us!</h2>
          <p>We've received your message and will get back to you shortly.</p>
          <button onClick={() => setSubmitted(false)}>Send another message</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <select
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="general">General Inquiry</option>
              <option value="samples">Sample Questions</option>
              <option value="orders">Order Support</option>
              <option value="partnerships">Partnership Opportunities</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
            ></textarea>
          </div>
          
          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      )}
    </div>
  );
} 