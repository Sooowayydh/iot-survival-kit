'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Device } from '../types';

// Dynamically import the Map component with no SSR
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const devicesRef = useRef<Device[]>([]);

  // Initialize devices and start monitoring
  useEffect(() => {
    // Initial device data
    const initialDevices: Device[] = [
      {
        id: '1',
        name: 'Command Center',
        position: [43.0481, -76.1474],
        temperature: 25.5,
        humidity: 60.0,
        pressure: 1013.2,
        connectedTo: ['2', '3', '4', '5', '6', '7', '8', '9'],
        status: 'Online',
        type: 'official',
        icon: null,
        signalStrength: 100,
        batteryLevel: 100
      },
      {
        id: '2',
        name: 'Survival Kit #1',
        position: [43.0592, -76.1435],
        temperature: 26.0,
        humidity: 55.0,
        pressure: 1012.8,
        connectedTo: ['1', '3', '5', '7'],
        status: 'Online',
        type: 'kit',
        icon: null,
        signalStrength: 85,
        batteryLevel: 92
      },
      {
        id: '3',
        name: 'Survival Kit #2',
        position: [43.0483, -76.1586],
        temperature: 24.5,
        humidity: 62.0,
        pressure: 1013.5,
        connectedTo: ['1', '2', '4', '6', '8'],
        status: 'Online',
        type: 'kit',
        icon: null,
        signalStrength: 75,
        batteryLevel: 88
      },
      {
        id: '4',
        name: 'Survival Kit #3',
        position: [43.0374, -76.1467],
        temperature: 25.8,
        humidity: 58.0,
        pressure: 1012.5,
        connectedTo: ['1', '3', '5', '9'],
        status: 'Online',
        type: 'kit',
        icon: null,
        signalStrength: 90,
        batteryLevel: 95
      },
      {
        id: '5',
        name: 'Survival Kit #4',
        position: [43.0525, -76.1325],
        temperature: 25.2,
        humidity: 59.0,
        pressure: 1013.0,
        connectedTo: ['1', '2', '4', '6', '7'],
        status: 'Online',
        type: 'kit',
        icon: null,
        signalStrength: 80,
        batteryLevel: 87
      },
      {
        id: '6',
        name: 'Survival Kit #5',
        position: [43.0436, -76.1625],
        temperature: 24.8,
        humidity: 61.0,
        pressure: 1012.2,
        connectedTo: ['1', '3', '5', '8'],
        status: 'Online',
        type: 'kit',
        icon: null,
        signalStrength: 70,
        batteryLevel: 93
      },
      {
        id: '7',
        name: 'Survival Kit #6',
        position: [43.0625, -76.1525],
        temperature: 25.1,
        humidity: 57.0,
        pressure: 1013.8,
        connectedTo: ['1', '2', '5', '8'],
        status: 'Online',
        type: 'kit',
        icon: null,
        signalStrength: 95,
        batteryLevel: 89
      },
      {
        id: '8',
        name: 'Survival Kit #7',
        position: [43.0385, -76.1685],
        temperature: 24.3,
        humidity: 63.0,
        pressure: 1011.5,
        connectedTo: ['1', '3', '6', '7', '9'],
        status: 'Online',
        type: 'kit',
        icon: null,
        signalStrength: 65,
        batteryLevel: 91
      },
      {
        id: '9',
        name: 'Survival Kit #8',
        position: [43.0275, -76.1385],
        temperature: 25.7,
        humidity: 56.0,
        pressure: 1012.0,
        connectedTo: ['1', '4', '8'],
        status: 'Online',
        type: 'kit',
        icon: null,
        signalStrength: 85,
        batteryLevel: 94
      }
    ];
    setDevices(initialDevices);
    devicesRef.current = initialDevices;

    // Start monitoring for device updates
    const interval = setInterval(() => {
      // Simulate new readings
      const newDevices = devicesRef.current.map(device => ({
        ...device,
        temperature: Number((device.temperature + (Math.random() - 0.5)).toFixed(1)),
        humidity: Number((device.humidity + (Math.random() - 0.5)).toFixed(1)),
        pressure: Number((device.pressure + (Math.random() - 0.5)).toFixed(1))
      }));
      setDevices(newDevices);
      devicesRef.current = newDevices;
    }, 5000);

    return () => clearInterval(interval);
  }, []); // No dependencies needed with useRef

  return (
    <div className="dashboard-container">
      <div className="map-section">
        <Map devices={devices} />
      </div>
    </div>
  );
} 