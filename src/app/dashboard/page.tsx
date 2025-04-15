'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Device } from '../types';
import { devices, THRESHOLDS } from '../data/devices';
import '../styles/Map.css';

// Dynamically import the Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="loading-container"><p className="loading-text">Loading map...</p></div>
});

export default function Dashboard() {
  const [devicesData, setDevicesData] = useState<Device[]>(devices);
  const [commandInput, setCommandInput] = useState('');
  const [commandLog, setCommandLog] = useState<{command: string, timestamp: string}[]>([]);
  const [thresholdAlerts, setThresholdAlerts] = useState<{
    deviceId: string;
    deviceName: string;
    timestamp: string;
    readings: {
      temperature?: { value: number; threshold: number; type: 'min' | 'max' };
      humidity?: { value: number; threshold: number; type: 'min' | 'max' };
      pressure?: { value: number; threshold: number; type: 'min' | 'max' };
    };
  }[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Set client state to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simulate real-time updates for device data
  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      setDevicesData(prevDevices => 
        prevDevices.map(device => {
          // Generate new readings with random variations
          const newTemperature = Number((device.temperature + (Math.random() - 0.5) * 4).toFixed(1));
          const newHumidity = Number((device.humidity + (Math.random() - 0.5) * 10).toFixed(1));
          const newPressure = Number((device.pressure + (Math.random() - 0.5) * 20).toFixed(1));
          
          // Create updated device
          const updatedDevice = {
            ...device,
            temperature: newTemperature,
            humidity: newHumidity,
            pressure: newPressure,
            signalStrength: Math.min(100, Math.max(0, device.signalStrength + (Math.random() - 0.5) * 10)),
            batteryLevel: Math.min(100, Math.max(0, device.batteryLevel - (Math.random() * 0.5)))
          };
          
          // Check if any readings exceed thresholds
          if (device.type === 'kit' && device.status === 'Online') {
            const readings: {
              temperature?: { value: number; threshold: number; type: 'min' | 'max' };
              humidity?: { value: number; threshold: number; type: 'min' | 'max' };
              pressure?: { value: number; threshold: number; type: 'min' | 'max' };
            } = {};
            
            // Check temperature
            if (newTemperature < THRESHOLDS.temperature.min) {
              readings.temperature = { 
                value: newTemperature, 
                threshold: THRESHOLDS.temperature.min, 
                type: 'min' 
              };
            } else if (newTemperature > THRESHOLDS.temperature.max) {
              readings.temperature = { 
                value: newTemperature, 
                threshold: THRESHOLDS.temperature.max, 
                type: 'max' 
              };
            }
            
            // Check humidity
            if (newHumidity < THRESHOLDS.humidity.min) {
              readings.humidity = { 
                value: newHumidity, 
                threshold: THRESHOLDS.humidity.min, 
                type: 'min' 
              };
            } else if (newHumidity > THRESHOLDS.humidity.max) {
              readings.humidity = { 
                value: newHumidity, 
                threshold: THRESHOLDS.humidity.max, 
                type: 'max' 
              };
            }
            
            // Check pressure
            if (newPressure < THRESHOLDS.pressure.min) {
              readings.pressure = { 
                value: newPressure, 
                threshold: THRESHOLDS.pressure.min, 
                type: 'min' 
              };
            } else if (newPressure > THRESHOLDS.pressure.max) {
              readings.pressure = { 
                value: newPressure, 
                threshold: THRESHOLDS.pressure.max, 
                type: 'max' 
              };
            }
            
            // If any reading exceeds thresholds, add to alerts
            if (Object.keys(readings).length > 0) {
              const timestamp = new Date().toLocaleTimeString();
              
              setThresholdAlerts(prev => [
                {
                  deviceId: device.id,
                  deviceName: device.name,
                  timestamp,
                  readings
                },
                ...prev.slice(0, 19) // Keep only the last 20 alerts
              ]);
            }
          }
          
          return updatedDevice;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isClient]);

  // Handle command submission
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    
    const timestamp = new Date().toLocaleTimeString();
    setCommandLog(prev => [
      { command: commandInput, timestamp },
      ...prev.slice(0, 9) // Keep only the last 10 commands
    ]);
    
    setCommandInput('');
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Survival Kit Network Dashboard</h1>
      
      <div className="dashboard-content">
        <div className="map-section">
          <Map devices={devicesData} />
        </div>
        
        <div className="threshold-alerts-section">
          <h2 className="section-title">Threshold Alerts</h2>
          <div className="alerts-list">
            {thresholdAlerts.length > 0 ? (
              thresholdAlerts.map((alert, index) => (
                <div key={index} className="alert-item">
                  <div className="alert-header">
                    <span className="alert-device">{alert.deviceName}</span>
                    <span className="alert-time">{alert.timestamp}</span>
                  </div>
                  <div className="alert-readings">
                    {alert.readings.temperature && (
                      <div className={`alert-reading ${alert.readings.temperature.type}`}>
                        Temperature: {alert.readings.temperature.value}°C 
                        ({alert.readings.temperature.type === 'min' ? 'Below' : 'Above'} threshold: {alert.readings.temperature.threshold}°C)
                      </div>
                    )}
                    {alert.readings.humidity && (
                      <div className={`alert-reading ${alert.readings.humidity.type}`}>
                        Humidity: {alert.readings.humidity.value}% 
                        ({alert.readings.humidity.type === 'min' ? 'Below' : 'Above'} threshold: {alert.readings.humidity.threshold}%)
                      </div>
                    )}
                    {alert.readings.pressure && (
                      <div className={`alert-reading ${alert.readings.pressure.type}`}>
                        Pressure: {alert.readings.pressure.value} hPa 
                        ({alert.readings.pressure.type === 'min' ? 'Below' : 'Above'} threshold: {alert.readings.pressure.threshold} hPa)
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-alerts">No threshold alerts at this time</div>
            )}
          </div>
        </div>
        
        <div className="command-section">
          <h2 className="section-title">Command Interface</h2>
          <form onSubmit={handleCommandSubmit} className="command-form">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Enter command..."
              className="command-input"
            />
            <button type="submit" className="command-button">Send</button>
          </form>
          
          <div className="command-log">
            <h3 className="subsection-title">Command Log</h3>
            <div className="log-entries">
              {commandLog.length > 0 ? (
                commandLog.map((entry, index) => (
                  <div key={index} className="log-entry">
                    <span className="log-time">{entry.timestamp}</span>
                    <span className="log-command">{entry.command}</span>
                  </div>
                ))
              ) : (
                <div className="no-entries">No commands sent yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 