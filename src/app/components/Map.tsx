'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, MapContainerProps } from 'react-leaflet';
import L from 'leaflet';
import { Device } from '../types';

// Fix for Leaflet marker icons in Next.js
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Fix for Next.js SSR
if (typeof window !== 'undefined') {
  L.Marker.prototype.options.icon = icon;
}

interface MapProps {
  devices: Device[];
}

export default function Map({ devices = [] }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="map-loading">
        Loading map...
      </div>
    );
  }

  return (
    <div className="map-container">
      <MapContainer
        center={[43.0481, -76.1474]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        whenReady={() => {
          // Force a resize event to ensure proper rendering
          setTimeout(() => {
            const map = document.querySelector('.leaflet-container') as HTMLElement;
            if (map) {
              map.style.height = '100%';
              map.style.width = '100%';
            }
          }, 100);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="bottomright" />

        {devices.map(device => (
          <Marker
            key={device.id}
            position={device.position}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: ${device.type === 'official' ? '#3b82f6' : '#10b981'}; width: ${device.type === 'official' ? '14px' : '12px'}; height: ${device.type === 'official' ? '14px' : '12px'}; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: device.type === 'official' ? [18, 18] : [16, 16],
              iconAnchor: device.type === 'official' ? [9, 9] : [8, 8]
            })}
          >
            <Popup>
              <div className="popup-content">
                <h3>{device.name}</h3>
                <p>Status: {device.status}</p>
                <p>Type: {device.type === 'official' ? 'Command Center' : 'Survival Kit'}</p>
                <p>Temperature: {device.temperature}°C</p>
                <p>Humidity: {device.humidity}%</p>
                <p>Pressure: {device.pressure}hPa</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 