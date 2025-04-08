'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { isStaticExport } from '@/app/lib/staticData'

// Import Leaflet directly
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Define interface for markers
interface Marker {
  position: [number, number];
  popup: string;
  sampleId?: string;
  sampleType?: string;
  onClick?: () => void;
}

interface MapProps {
  markers?: Marker[];
  center?: [number, number];
  zoom?: number;
  handleSampleSelect?: (sampleId: string) => void;
}

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

// Add useMap hook
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
)

// Define leafletSelectSample in the Window interface
declare global {
  interface Window {
    leafletSelectSample: (sampleId: string) => void;
    leafletMap: L.Map | null;
  }
}

// MapController component to expose the map instance
function MapController() {
  const map = useMapEvents({
    // Any events you want to listen to
    load: () => {
      console.log('Map loaded');
    }
  });
  
  useEffect(() => {
    if (typeof window !== 'undefined' && map) {
      window.leafletMap = map;
      
      return () => {
        window.leafletMap = null;
      };
    }
  }, [map]);
  
  return null;
}

export default function LeafletMap({ 
  markers = [], 
  center = [37.7749, -122.4194], // Default to San Francisco
  zoom = 4,
  handleSampleSelect
}: MapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isStatic, setIsStatic] = useState(false)
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)
  const [cssLoaded, setCssLoaded] = useState(true) // Set default to true since we import the CSS directly
  const [loadError, setLoadError] = useState<string | null>(null)
  const mapRef = useRef<L.Map | null>(null);
  
  // Debug
  console.log("LeafletMap rendering with markers:", markers.length, "center:", center, "zoom:", zoom);

  // Set up the leafletSelectSample function on client side only
  useEffect(() => {
    // Use a safer pattern for Cloudflare Pages edge runtime
    if (typeof window === 'undefined' || !handleSampleSelect) return;
    
    try {
      window.leafletSelectSample = (sampleId: string) => {
        console.log("leafletSelectSample called with:", sampleId);
        if (handleSampleSelect) handleSampleSelect(sampleId);
      };
      
      // Make sure window.leafletMap is initialized
      window.leafletMap = window.leafletMap || null;
      
      // Return cleanup function 
      return () => {
        if (typeof window !== 'undefined') {
          window.leafletSelectSample = () => {
            console.log("leafletSelectSample cleanup");
          }; 
        }
      };
    } catch (error) {
      console.error('Error setting up leaflet sample selection:', error);
    }
  }, [handleSampleSelect]);

  useEffect(() => {
    console.log("LeafletMap: Initial mount effect");
    setIsMounted(true);
    
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
    
    setIsStatic(staticMode);
    
    // Since we import the CSS directly, we can set leaflet as loaded immediately
    setIsLeafletLoaded(true);
    setCssLoaded(true);
    
    // Setup Leaflet icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
    
    console.log("LeafletMap: Setup complete");
  }, []);

  if (loadError) {
    console.error("LeafletMap: Rendering error state:", loadError);
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
    console.log("LeafletMap: Not mounted yet");
    return <div className="map-placeholder">Loading map...</div>
  }
  
  if (isStatic) {
    console.log("LeafletMap: Rendering static version");
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
    console.log("LeafletMap: Still loading libraries");
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
  console.log('Rendering map with markers:', markers.length);

  const typeColorMap: Record<string, string> = {
    'bacterial': '#10b981',
    'cell line': '#8b5cf6',
    'tissue': '#ef4444',
    'soil': '#92400e',
    'water': '#0ea5e9',
    'environmental': '#3b82f6',
    'botanical': '#65a30d',
    'viral': '#db2777',
    'default': '#6b7280'
  };

  // Get color based on sample type with proper typing
  const getMarkerColor = (type: string | undefined): string => {
    return type ? (typeColorMap[type.toLowerCase()] || typeColorMap['default']) : typeColorMap['default'];
  };

  console.log("LeafletMap: Rendering actual map component");
  return (
    <MapContainerWithNoSSR 
      center={center} 
      zoom={zoom} 
      style={{ height: '400px', width: '100%' }}
      whenCreated={(map) => {
        mapRef.current = map;
        if (typeof window !== 'undefined') {
          window.leafletMap = map;
        }
      }}
    >
      <MapController />
      <TileLayerWithNoSSR
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Legend for marker types */}
      <div className="leaflet-bottom leaflet-right">
        <div className="leaflet-control leaflet-bar bg-white p-2 rounded shadow-md">
          <h4 className="font-bold text-sm mb-1">Sample Types</h4>
          {Object.entries(typeColorMap).filter(([key]) => key !== 'default').map(([type, color]) => (
            <div key={type} className="flex items-center mb-1">
              <span 
                style={{ 
                  backgroundColor: color, 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  display: 'inline-block',
                  marginRight: '4px'
                }}
              ></span>
              <span className="text-xs capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
      
      {markers.map((marker, index) => {
        console.log(`Rendering marker ${index} at position:`, marker.position);
        return (
          <MarkerWithNoSSR 
            key={index} 
            position={marker.position}
            eventHandlers={{
              click: () => {
                console.log("Marker clicked:", marker.sampleId);
                if (marker.onClick) {
                  marker.onClick();
                } else if (marker.sampleId && handleSampleSelect) {
                  handleSampleSelect(marker.sampleId);
                }
              }
            }}
            icon={new L.DivIcon({
              className: 'custom-map-marker',
              html: `<div style="background-color: ${getMarkerColor(marker.sampleType)}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
              popupAnchor: [0, -8]
            })}
          >
            <PopupWithNoSSR>
              <div dangerouslySetInnerHTML={{ __html: marker.popup }} />
            </PopupWithNoSSR>
          </MarkerWithNoSSR>
        );
      })}
    </MapContainerWithNoSSR>
  )
}
