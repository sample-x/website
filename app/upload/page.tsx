'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UploadPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    // This code only runs in the browser
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    // Static rendering fallback
    return (
      <div className="upload-page">
        <div className="page-header">
          <h1>Upload Sample</h1>
        </div>
        <div className="container">
          <p>Loading upload form...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="upload-page">
      <div className="page-header">
        <h1>Upload Sample</h1>
      </div>
      <div className="container">
        <div className="upload-form">
          <p>This is a client-side form for uploading samples.</p>
          <p>In a production environment, this would contain a full upload flow.</p>
          <div className="form-group">
            <label>Sample Name</label>
            <input type="text" placeholder="Enter sample name" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Enter sample description"></textarea>
          </div>
          <div className="form-group">
            <label>Price ($)</label>
            <input type="number" placeholder="Enter price" />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" placeholder="Enter location" />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary">Upload Sample</button>
            <Link href="/samples" className="btn btn-secondary">Cancel</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
