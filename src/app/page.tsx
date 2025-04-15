'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Map component with no SSR
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => <div className="map-loading">Loading map...</div>
});

// Define threshold values for alerts
const THRESHOLDS = {
  temperature: {
    min: 15,
    max: 30
  },
  humidity: {
    min: 40,
    max: 80
  },
  pressure: {
    min: 980,
    max: 1020
  }
};

// Define interfaces
interface Device {
  id: string;
  name: string;
  position: [number, number];
  status: 'Online' | 'Offline';
  temperature: number;
  humidity: number;
  pressure: number;
  type: 'official' | 'kit';
  connectedTo: string[];
  signalStrength: number;
  batteryLevel: number;
  lastAlert?: string;
  lastReading?: string;
}

interface ThresholdAlert {
  deviceId: string;
  deviceName: string;
  timestamp: string;
  readings: {
    temperature?: { value: number; threshold: number; type: 'min' | 'max' };
    humidity?: { value: number; threshold: number; type: 'min' | 'max' };
    pressure?: { value: number; threshold: number; type: 'min' | 'max' };
  };
}

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [thresholdAlerts, setThresholdAlerts] = useState<ThresholdAlert[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  // Initialize devices and start monitoring
  useEffect(() => {
    // Initial device data
    const initialDevices: Device[] = [
      {
        id: '1',
        name: 'Command Center',
        position: [43.0481, -76.1474],
        status: 'Online',
        temperature: 22.5,
        humidity: 45,
        pressure: 1013,
        type: 'official',
        connectedTo: ['2', '3', '4', '5'],
        signalStrength: 100,
        batteryLevel: 100
      },
      {
        id: '2',
        name: 'Survival Kit #1',
        position: [43.0521, -76.1514],
        status: 'Online',
        temperature: 23.1,
        humidity: 48,
        pressure: 1012,
        type: 'kit',
        connectedTo: ['1', '3', '6'],
        signalStrength: 85,
        batteryLevel: 92
      },
      {
        id: '3',
        name: 'Survival Kit #2',
        position: [43.0441, -76.1434],
        status: 'Online',
        temperature: 22.8,
        humidity: 52,
        pressure: 1011,
        type: 'kit',
        connectedTo: ['1', '2', '4', '7'],
        signalStrength: 78,
        batteryLevel: 88
      },
      {
        id: '4',
        name: 'Survival Kit #3',
        position: [43.0561, -76.1394],
        status: 'Online',
        temperature: 23.5,
        humidity: 50,
        pressure: 1010,
        type: 'kit',
        connectedTo: ['1', '3', '5', '8'],
        signalStrength: 92,
        batteryLevel: 95
      },
      {
        id: '5',
        name: 'Survival Kit #4',
        position: [43.0401, -76.1554],
        status: 'Offline',
        temperature: 0,
        humidity: 0,
        pressure: 0,
        type: 'kit',
        connectedTo: ['1', '4', '9'],
        signalStrength: 0,
        batteryLevel: 0
      },
      {
        id: '6',
        name: 'Survival Kit #5',
        position: [43.0601, -76.1474],
        status: 'Online',
        temperature: 22.2,
        humidity: 55,
        pressure: 1009,
        type: 'kit',
        connectedTo: ['2', '7', '8'],
        signalStrength: 75,
        batteryLevel: 82
      },
      {
        id: '7',
        name: 'Survival Kit #6',
        position: [43.0481, -76.1594],
        status: 'Online',
        temperature: 23.8,
        humidity: 58,
        pressure: 1008,
        type: 'kit',
        connectedTo: ['3', '6', '9'],
        signalStrength: 68,
        batteryLevel: 79
      },
      {
        id: '8',
        name: 'Survival Kit #7',
        position: [43.0361, -76.1434],
        status: 'Online',
        temperature: 22.0,
        humidity: 62,
        pressure: 1007,
        type: 'kit',
        connectedTo: ['4', '6', '9'],
        signalStrength: 72,
        batteryLevel: 85
      },
      {
        id: '9',
        name: 'Survival Kit #8',
        position: [43.0521, -76.1354],
        status: 'Online',
        temperature: 23.2,
        humidity: 65,
        pressure: 1006,
        type: 'kit',
        connectedTo: ['5', '7', '8'],
        signalStrength: 65,
        batteryLevel: 77
      }
    ];

    setDevices(initialDevices);

    // Check for threshold alerts initially
    checkThresholds(initialDevices);

    // Update last updated time
    setLastUpdated('Just now');

    // Set up interval to update device data and check thresholds
    const interval = setInterval(() => {
      setDevices(prevDevices => {
        // Generate new readings with more varied random variations
        const updatedDevices = prevDevices.map(device => {
          if (device.status === 'Online') {
            // Temperature: vary by up to ±3°C
            const newTemperature = Number((device.temperature + (Math.random() - 0.5) * 6).toFixed(1));
            
            // Humidity: vary by up to ±10%
            const newHumidity = Number((device.humidity + (Math.random() - 0.5) * 20).toFixed(1));
            
            // Pressure: vary by up to ±15 hPa
            const newPressure = Number((device.pressure + (Math.random() - 0.5) * 30).toFixed(1));
            
            return {
              ...device,
              temperature: newTemperature,
              humidity: newHumidity,
              pressure: newPressure,
              signalStrength: Math.min(100, Math.max(0, device.signalStrength + (Math.random() - 0.5) * 10)),
              batteryLevel: Math.min(100, Math.max(0, device.batteryLevel - (Math.random() * 0.5)))
            };
          }
          return device;
        });
        
        // Check for threshold alerts
        checkThresholds(updatedDevices);
        
        // Update last updated time
        setLastUpdated('Just now');
        
        return updatedDevices;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Function to check if readings exceed thresholds
  const checkThresholds = (devicesToCheck: Device[]) => {
    const newAlerts: ThresholdAlert[] = [];
    
    devicesToCheck.forEach(device => {
      if (device.type === 'kit' && device.status === 'Online') {
        const readings: {
          temperature?: { value: number; threshold: number; type: 'min' | 'max' };
          humidity?: { value: number; threshold: number; type: 'min' | 'max' };
          pressure?: { value: number; threshold: number; type: 'min' | 'max' };
        } = {};
        
        // Check temperature
        if (device.temperature < THRESHOLDS.temperature.min) {
          readings.temperature = { 
            value: device.temperature, 
            threshold: THRESHOLDS.temperature.min, 
            type: 'min' 
          };
        } else if (device.temperature > THRESHOLDS.temperature.max) {
          readings.temperature = { 
            value: device.temperature, 
            threshold: THRESHOLDS.temperature.max, 
            type: 'max' 
          };
        }
        
        // Check humidity
        if (device.humidity < THRESHOLDS.humidity.min) {
          readings.humidity = { 
            value: device.humidity, 
            threshold: THRESHOLDS.humidity.min, 
            type: 'min' 
          };
        } else if (device.humidity > THRESHOLDS.humidity.max) {
          readings.humidity = { 
            value: device.humidity, 
            threshold: THRESHOLDS.humidity.max, 
            type: 'max' 
          };
        }
        
        // Check pressure
        if (device.pressure < THRESHOLDS.pressure.min) {
          readings.pressure = { 
            value: device.pressure, 
            threshold: THRESHOLDS.pressure.min, 
            type: 'min' 
          };
        } else if (device.pressure > THRESHOLDS.pressure.max) {
          readings.pressure = { 
            value: device.pressure, 
            threshold: THRESHOLDS.pressure.max, 
            type: 'max' 
          };
        }
        
        // If any reading exceeds thresholds, add to alerts
        if (Object.keys(readings).length > 0) {
          newAlerts.push({
            deviceId: device.id,
            deviceName: device.name,
            timestamp: new Date().toLocaleTimeString(),
            readings
          });
        }
      }
    });
    
    // Update threshold alerts
    if (newAlerts.length > 0) {
      setThresholdAlerts(prev => [
        ...newAlerts,
        ...prev.slice(0, 19) // Keep only the last 20 alerts
      ]);
    }
  };

  return (
    <div className="app">
      <header>
        <div className="container">
          <h1>Survival Kit Dashboard</h1>
        </div>
      </header>
      
      <main>
        <div className="container">
          <div className="grid">
            {/* Map Section */}
            <div className="card">
              <div className="card-header">
                <h2>Location Map</h2>
              </div>
              <div className="card-body">
                <Map devices={devices} />
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="card">
              <div className="card-header">
                <h2>Statistics</h2>
              </div>
              <div className="card-body">
                <div className="stats">
                  <div className="stat-item blue">
                    <div className="stat-icon">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3>Active Devices</h3>
                      <p>{devices.filter(d => d.status === 'Online').length}</p>
                    </div>
                  </div>
                  
                  <div className="stat-item green">
                    <div className="stat-icon">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3>System Status</h3>
                      <p>Operational</p>
                    </div>
                  </div>
                  
                  <div className="stat-item purple">
                    <div className="stat-icon">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3>Last Updated</h3>
                      <p>{lastUpdated}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Threshold Alerts Section */}
            <div className="card">
              <div className="card-header">
                <h2>Threshold Alerts</h2>
              </div>
              <div className="card-body">
                <div className="alerts-list">
                  {thresholdAlerts.length > 0 ? (
                    thresholdAlerts.map((alert, index) => (
                      <div key={index} className="alert-item">
                        <span className="alert-time">{alert.timestamp}</span>
                        <span className="alert-device">{alert.deviceName}</span>
                        <div className="alert-readings">
                          {alert.readings.temperature && (
                            <div className={`alert-reading ${alert.readings.temperature.type}`}>
                              <strong>Temperature:</strong> {alert.readings.temperature.value}°C 
                              ({alert.readings.temperature.type === 'min' ? 'Below' : 'Above'} threshold: {alert.readings.temperature.threshold}°C)
                            </div>
                          )}
                          {alert.readings.humidity && (
                            <div className={`alert-reading ${alert.readings.humidity.type}`}>
                              <strong>Humidity:</strong> {alert.readings.humidity.value}% 
                              ({alert.readings.humidity.type === 'min' ? 'Below' : 'Above'} threshold: {alert.readings.humidity.threshold}%)
                            </div>
                          )}
                          {alert.readings.pressure && (
                            <div className={`alert-reading ${alert.readings.pressure.type}`}>
                              <strong>Pressure:</strong> {alert.readings.pressure.value} hPa 
                              ({alert.readings.pressure.type === 'min' ? 'Below' : 'Above'} threshold: {alert.readings.pressure.threshold} hPa)
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-alerts">No threshold alerts. All readings within normal range.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
