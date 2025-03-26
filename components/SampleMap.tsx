'use client';  // Add this at the top

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '@/styles/Map.module.css';
import { Sample } from '@/types/sample';
import { sampleTypeColors } from '@/utils/constants';

// Fix for Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

interface SampleMapProps {
  samples: Sample[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}

const SampleMap: React.FC<SampleMapProps> = ({
  samples,
  center = [0, 0],
  zoom = 2,
  interactive = true,
  onBoundsChange,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        center: center,
        zoom: zoom,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        scrollWheelZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      markersRef.current = L.layerGroup().addTo(mapRef.current);

      if (onBoundsChange) {
        mapRef.current.on('moveend', () => {
          const bounds = mapRef.current?.getBounds();
          if (bounds) {
            onBoundsChange(bounds);
          }
        });
      }
    }

    // Update markers
    if (markersRef.current) {
      markersRef.current.clearLayers();

      samples.forEach((sample) => {
        if (sample.latitude && sample.longitude) {
          const markerColor = sampleTypeColors[sample.type] || '#808080';
          
          const markerHtml = `
            <div 
              class="${styles.marker}" 
              style="background-color: ${markerColor};"
            ></div>
          `;

          const icon = L.divIcon({
            html: markerHtml,
            className: 'custom-marker',
            iconSize: [25, 25],
            iconAnchor: [12, 12],
          });

          const marker = L.marker([sample.latitude, sample.longitude], { icon })
            .addTo(markersRef.current as L.LayerGroup);

          const popupContent = `
            <div class="${styles.popup}">
              <div class="${styles.popupContent}">
                <div class="${styles.popupTitle}">${sample.name}</div>
                <div class="${styles.popupInfo}">
                  <strong>Type:</strong> ${sample.type}<br>
                  <strong>Location:</strong> ${sample.location}<br>
                  <strong>Storage:</strong> ${sample.storage_condition}<br>
                  <strong>Quantity:</strong> ${sample.quantity}<br>
                  <strong>Price:</strong> $${sample.price}
                </div>
                <div class="${styles.popupActions}">
                  <button 
                    class="${styles.button} ${styles.infoButton}"
                    onclick="window.dispatchEvent(new CustomEvent('showSampleInfo', { detail: ${sample.id} }))"
                  >
                    Info
                  </button>
                  <button 
                    class="${styles.button} ${styles.cartButton}"
                    onclick="window.dispatchEvent(new CustomEvent('addToCart', { detail: ${sample.id} }))"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [samples, center, zoom, interactive, onBoundsChange]);

  return <div id="map" className={styles.map} />;
};

export default SampleMap; 