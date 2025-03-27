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
  const [cssLoaded, setCssLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
    
    // Check if we're in static mode but respect localStorage override
    let staticMode = isStaticExport(); 
    if (typeof window !== 'undefined') {
      try {
        const forceDynamic = localStorage.getItem('forceDynamicMode') === 'true';
        if (forceDynamic) staticMode = false;
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    setIsStatic(staticMode)
    
    // Import leaflet only in the browser
    if (typeof window !== 'undefined') {
      // Load Leaflet CSS
      try {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
          link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=='
          link.crossOrigin = 'anonymous'
          document.head.appendChild(link)
          
          link.onload = () => {
            setCssLoaded(true)
            console.log('Leaflet CSS loaded successfully')
          }
          
          link.onerror = (e) => {
            console.error('Failed to load Leaflet CSS:', e)
            setLoadError('Failed to load map resources. Please check your internet connection.')
          }
        } else {
          // CSS already loaded
          setCssLoaded(true)
        }
      } catch (e) {
        console.error('Error loading Leaflet CSS:', e)
        setLoadError('Error initializing map. Please try refreshing the page.')
      }
      
      // Load Leaflet JS
      try {
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
          console.log('Leaflet JS loaded successfully')
        }).catch(err => {
          console.error('Failed to load Leaflet library:', err)
          setLoadError('Failed to load map library. Please try refreshing the page.')
        })
      } catch (e) {
        console.error('Error initializing Leaflet:', e)
        setLoadError('Error initializing map. Please try refreshing the page.')
      }
    }
  }, [])

  if (loadError) {
    return (
      <div className="map-error" style={{ 
        height: '400px', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee2e2',
        borderRadius: '6px',
        padding: '20px',
        color: '#b91c1c',
        flexDirection: 'column',
        textAlign: 'center'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: '12px'}}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div>
          <p style={{fontWeight: '500', marginBottom: '4px'}}>Map Loading Error</p>
          <p style={{fontSize: '14px'}}>{loadError}</p>
        </div>
      </div>
    )
  }

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
                  <li key={i}>{marker.popup.replace(/<\/?[^>]+(>|$)/g, "")} ({marker.position[0].toFixed(2)}, {marker.position[1].toFixed(2)})</li>
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
  if (!isLeafletLoaded || !cssLoaded) {
    return (
      <div className="map-placeholder" style={{
        height: '400px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px'
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            border: '3px solid rgba(0, 0, 0, 0.1)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px auto'
          }}></div>
          <p>Loading map library...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Debug info for markers
  console.log('Rendering map with markers:', markers.length > 0 ? markers : 'No markers available')

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
