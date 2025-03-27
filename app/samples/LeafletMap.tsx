'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { isStaticExport } from '@/app/lib/staticData'

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainerWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayerWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const MarkerWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const PopupWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface MapProps {
  markers?: Array<{
    position: [number, number]
    popup: string
  }>
  center?: [number, number]
  zoom?: number
}

export default function LeafletMap({ 
  markers = [], 
  center = [37.7749, -122.4194], // Default to San Francisco
  zoom = 4 
}: MapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isStatic, setIsStatic] = useState(false)
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setIsStatic(isStaticExport())
    
    // Import leaflet only in the browser
    if (typeof window !== 'undefined') {
      // Load Leaflet CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
      document.head.appendChild(link)
      
      // Load Leaflet JS
      import('leaflet').then((L) => {
        // Fix for default marker icons in Leaflet with Next.js
        const DefaultIcon = L.default.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
        
        L.default.Marker.prototype.options.icon = DefaultIcon
        setIsLeafletLoaded(true)
      })
    }
  }, [])

  if (!isMounted) {
    return <div className="map-placeholder">Loading map...</div>
  }
  
  if (isStatic) {
    return (
      <div className="static-map-container" style={{ height: '400px', width: '100%', position: 'relative', background: '#e5e7eb', borderRadius: '6px' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <h3>Sample Map</h3>
          <p>Interactive map not available in static mode.</p>
          <p>Map would display {markers.length} sample locations.</p>
          {markers.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <strong>Sample locations:</strong>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {markers.slice(0, 5).map((marker, i) => (
                  <li key={i}>{marker.popup} ({marker.position[0].toFixed(2)}, {marker.position[1].toFixed(2)})</li>
                ))}
                {markers.length > 5 && <li>...and {markers.length - 5} more</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  // If Leaflet isn't loaded yet, show a loading indicator
  if (!isLeafletLoaded) {
    return <div className="map-placeholder">Loading map library...</div>
  }

  return (
    <MapContainerWithNoSSR 
      center={center} 
      zoom={zoom} 
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayerWithNoSSR
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {markers.map((marker, index) => (
        <MarkerWithNoSSR key={index} position={marker.position}>
          <PopupWithNoSSR>{marker.popup}</PopupWithNoSSR>
        </MarkerWithNoSSR>
      ))}
    </MapContainerWithNoSSR>
  )
}
