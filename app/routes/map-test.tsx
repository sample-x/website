import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapTest() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add a test marker
    L.marker([51.5, -0.09])
      .addTo(map)
      .bindPopup('A test marker!')
      .openPopup();

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div>
      <h1>Map Test</h1>
      <div ref={mapRef} style={{ height: '400px', width: '100%' }} />
    </div>
  );
} 