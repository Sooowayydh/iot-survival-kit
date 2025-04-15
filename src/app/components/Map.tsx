'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import MeshNetwork from './MeshNetwork';
import { Device } from '../types';
import { devices as initialDevices, THRESHOLDS, findShortestPath } from '../data/devices';
import { Thermometer, Droplets, Gauge, AlertTriangle, Send, X } from 'lucide-react';
import '../styles/Map.css';

// Fix for default marker icons in Next.js
const createCustomIcon = (color: string) => {
  if (typeof window === 'undefined') return null;
  
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

interface MapProps {
  center?: [number, number];
  zoom?: number;
  devices?: Device[];
}

export default function Map({ center = [43.0481, -76.1474], zoom = 13, devices: propsDevices }: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [deviceData, setDeviceData] = useState<Device[]>(propsDevices || initialDevices);
  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  const [messageLog, setMessageLog] = useState<{from: string, to: string, message: string, timestamp: string, path?: string[]}[]>([]);
  const [alertMode, setAlertMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
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

  // This is needed because Leaflet requires the window object
  useEffect(() => {
    setMounted(true);
    
    // Dynamically import Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
    link.crossOrigin = '';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Check if a reading exceeds thresholds
  const checkThresholds = (device: Device) => {
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
      
      // Also add to message log
      const alertMessages: string[] = [];
      
      if (readings.temperature) {
        alertMessages.push(
          `Temperature ${readings.temperature.type === 'min' ? 'below' : 'above'} threshold: ${readings.temperature.value}°C (${readings.temperature.type === 'min' ? 'min' : 'max'} ${readings.temperature.threshold}°C)`
        );
      }
      
      if (readings.humidity) {
        alertMessages.push(
          `Humidity ${readings.humidity.type === 'min' ? 'below' : 'above'} threshold: ${readings.humidity.value}% (${readings.humidity.type === 'min' ? 'min' : 'max'} ${readings.humidity.threshold}%)`
        );
      }
      
      if (readings.pressure) {
        alertMessages.push(
          `Pressure ${readings.pressure.type === 'min' ? 'below' : 'above'} threshold: ${readings.pressure.value} hPa (${readings.pressure.type === 'min' ? 'min' : 'max'} ${readings.pressure.threshold} hPa)`
        );
      }
      
      setMessageLog(prev => [
        { 
          from: device.name, 
          to: 'Command Center', 
          message: `ALERT: ${alertMessages.join(', ')}`, 
          timestamp
        },
        ...prev.slice(0, 9)
      ]);
    }
  };

  // Simulate real-time updates for device data
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setDeviceData(prevDevices => 
        prevDevices.map(device => {
          // Generate new readings with more varied random variations
          // Temperature: vary by up to ±3°C
          const newTemperature = Number((device.temperature + (Math.random() - 0.5) * 6).toFixed(1));
          
          // Humidity: vary by up to ±10%
          const newHumidity = Number((device.humidity + (Math.random() - 0.5) * 20).toFixed(1));
          
          // Pressure: vary by up to ±15 hPa
          const newPressure = Number((device.pressure + (Math.random() - 0.5) * 30).toFixed(1));
          
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
            checkThresholds(updatedDevice);
          }
          
          return updatedDevice;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [mounted]);

  // Function to send alert from command center to all kits
  const sendAlertToAllKits = () => {
    if (!alertMessage.trim()) return;
    
    const commandCenter = deviceData.find(d => d.id === '1');
    if (!commandCenter) return;
    
    const timestamp = new Date().toLocaleTimeString();
    
    // Send alert to each kit
    deviceData.filter(d => d.type === 'kit' && d.status === 'Online').forEach(kit => {
      // Find path from command center to this kit
      const path = findShortestPath('1', kit.id, deviceData);
      
      if (path.length > 0) {
        // Update the kit's lastAlert property
        setDeviceData(prevDevices => 
          prevDevices.map(device => 
            device.id === kit.id 
              ? { ...device, lastAlert: alertMessage } 
              : device
          )
        );
        
        // Add message to log
        setMessageLog(prev => [
          { 
            from: 'Command Center', 
            to: kit.name, 
            message: `ALERT: ${alertMessage}`, 
            timestamp,
            path: path.length > 2 ? path.map(id => deviceData.find(d => d.id === id)?.name || id) : undefined
          },
          ...prev.slice(0, 9)
        ]);
        
        // Simulate kit response with sensor readings
        setTimeout(() => {
          const kitDevice = deviceData.find(d => d.id === kit.id);
          if (kitDevice) {
            const readingMessage = `Temperature: ${kitDevice.temperature}°C, Humidity: ${kitDevice.humidity}%, Pressure: ${kitDevice.pressure} hPa`;
            
            // Update the kit's lastReading property
            setDeviceData(prevDevices => 
              prevDevices.map(device => 
                device.id === kit.id 
                  ? { ...device, lastReading: readingMessage } 
                  : device
              )
            );
            
            // Add response to log
            setMessageLog(prev => [
              { 
                from: kit.name, 
                to: 'Command Center', 
                message: readingMessage, 
                timestamp: new Date().toLocaleTimeString(),
                path: path.length > 2 ? path.map(id => deviceData.find(d => d.id === id)?.name || id).reverse() : undefined
              },
              ...prev.slice(0, 9)
            ]);
          }
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
      }
    });
    
    // Reset alert mode and message
    setAlertMode(false);
    setAlertMessage('');
  };

  // Simulate LORA mesh network communication with message hopping
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      // Randomly activate connections
      const newActiveConnections: string[] = [];
      
      // Command center to survival kits
      deviceData.forEach(device => {
        if (device.type === 'kit' && device.status === 'Online') {
          // Higher chance of connection if signal strength is good
          if (Math.random() < (device.signalStrength / 100)) {
            newActiveConnections.push(`1-${device.id}`);
          }
        }
      });
      
      // Survival kits to each other
      deviceData.filter(d => d.type === 'kit' && d.status === 'Online').forEach(kit => {
        kit.connectedTo.forEach(connectedId => {
          const connectedDevice = deviceData.find(d => d.id === connectedId);
          if (connectedDevice && connectedDevice.status === 'Online' && Math.random() < 0.7) {
            newActiveConnections.push(`${kit.id}-${connectedId}`);
          }
        });
      });
      
      setActiveConnections(newActiveConnections);
      
      // Simulate kits sending reading data to command center
      const commandCenter = deviceData.find(d => d.id === '1');
      if (commandCenter && commandCenter.status === 'Online') {
        // Select a random kit to send data
        const onlineKits = deviceData.filter(d => d.type === 'kit' && d.status === 'Online');
        if (onlineKits.length > 0) {
          const kitIndex = Math.floor(Math.random() * onlineKits.length);
          const kit = onlineKits[kitIndex];
          
          // Find the path from kit to command center
          const path = findShortestPath(kit.id, '1', deviceData);
          
          if (path.length > 0) {
            // Activate connections along the path
            for (let i = 0; i < path.length - 1; i++) {
              newActiveConnections.push(`${path[i]}-${path[i+1]}`);
            }
            
            // Create reading data message
            const readingMessage = `Temperature: ${kit.temperature.toFixed(1)}°C, Humidity: ${kit.humidity.toFixed(1)}%, Pressure: ${kit.pressure.toFixed(1)} hPa`;
            const timestamp = new Date().toLocaleTimeString();
            
            // Update the kit's lastReading property
            setDeviceData(prevDevices => 
              prevDevices.map(device => 
                device.id === kit.id 
                  ? { ...device, lastReading: readingMessage } 
                  : device
              )
            );
            
            // Add the reading to the message log
            setMessageLog(prev => [
              { 
                from: kit.name, 
                to: 'Command Center', 
                message: readingMessage, 
                timestamp,
                path: path.length > 2 ? path.map(id => deviceData.find(d => d.id === id)?.name || id) : undefined
              },
              ...prev.slice(0, 9) // Keep only the last 10 messages
            ]);
            
            // Check if readings exceed thresholds and add to threshold alerts
            checkThresholds(kit);
          }
        }
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [mounted, deviceData]);

  if (!mounted) {
    return <div className="loading-container">
      <p className="loading-text">Loading map...</p>
    </div>;
  }

  return (
    <div className="map-wrapper">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        className="map-container"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* LORA Mesh Network Visualization */}
        <MeshNetwork 
          nodes={deviceData} 
          activeConnections={activeConnections} 
        />
        
        {deviceData.map(device => {
          // Create icon only on client side
          const icon = device.type === 'official' 
            ? createCustomIcon('#3b82f6') // Blue for officials
            : createCustomIcon('#10b981'); // Green for survival kits
            
          return (
            <Marker 
              key={device.id} 
              position={device.position} 
              icon={icon || undefined}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{device.name}</h3>
                  <div className={`status-badge ${device.status === 'Online' ? 'status-online' : 'status-offline'}`}>
                    {device.status}
                  </div>
                  <p className="device-type">Type: {device.type === 'official' ? 'Command Center' : 'Survival Kit'}</p>
                  
                  <div className="sensor-readings">
                    <h4>Current Sensor Readings</h4>
                    <div className="sensor-reading">
                      <Thermometer className="temperature-icon" />
                      <span>Temperature: {device.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="sensor-reading">
                      <Droplets className="humidity-icon" />
                      <span>Humidity: {device.humidity.toFixed(1)}%</span>
                    </div>
                    <div className="sensor-reading">
                      <Gauge className="pressure-icon" />
                      <span>Pressure: {device.pressure.toFixed(1)} hPa</span>
                    </div>
                  </div>
                  
                  <div className="device-stats">
                    <h4>Device Stats</h4>
                    <p>Signal Strength: {device.signalStrength.toFixed(0)}%</p>
                    <p>Battery Level: {device.batteryLevel.toFixed(0)}%</p>
                  </div>
                  
                  {device.lastAlert && (
                    <div className="alert-info">
                      <h4>
                        <AlertTriangle />
                        Last Alert
                      </h4>
                      <p>{device.lastAlert}</p>
                    </div>
                  )}
                  
                  {device.lastReading && (
                    <div className="reading-info">
                      <h4>Last Reading</h4>
                      <p>{device.lastReading}</p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Message Log Panel */}
      <div className="message-log-panel">
        <h3>Sensor Readings from Kits to Command Center</h3>
        <div className="message-list">
          {messageLog.length > 0 ? (
            messageLog.map((msg, index) => (
              <div key={index} className="message-item">
                <div className="message-header">
                  <span className="message-from">{msg.from} → {msg.to}</span>
                  <span className="message-time">{msg.timestamp}</span>
                </div>
                <p className="message-text">{msg.message}</p>
                {msg.path && msg.path.length > 2 && (
                  <p className="message-path">
                    Path: {msg.path.join(' → ')}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="no-messages">
              <AlertTriangle />
              <p>No readings yet. Waiting for data from kits...</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Alert Panel for Command Center */}
      <div className="alert-panel">
        <h3>Command Center Alert System</h3>
        {!alertMode ? (
          <button 
            onClick={() => setAlertMode(true)}
            className="alert-button"
          >
            <AlertTriangle />
            Send Alert to All Kits
          </button>
        ) : (
          <div className="alert-form">
            <input
              type="text"
              placeholder="Enter alert message..."
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              className="alert-input"
            />
            <div className="alert-buttons">
              <button 
                onClick={sendAlertToAllKits}
                className="alert-button"
              >
                <Send />
                Send Alert
              </button>
              <button 
                onClick={() => {
                  setAlertMode(false);
                  setAlertMessage('');
                }}
                className="cancel-button"
              >
                <X />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 