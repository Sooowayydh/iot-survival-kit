'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import MeshNetwork from './MeshNetwork';

// Fix for default marker icons in Next.js
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

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

// Define the device type
interface Device {
  id: string;
  name: string;
  position: [number, number];
  status: 'Online' | 'Offline';
  temperature: number;
  humidity: number;
  pressure: number;
  type: 'official' | 'kit';
  icon: L.DivIcon;
  connectedTo: string[];
  signalStrength: number;
  batteryLevel: number;
  lastAlert?: string; // Last alert received from command center
  lastReading?: string; // Last sensor reading sent to command center
}

// Sample device data with more nodes
const devices: Device[] = [
  {
    id: '1',
    name: 'Command Center',
    position: [43.0481, -76.1474] as [number, number],
    status: 'Online',
    temperature: 25.5,
    humidity: 60.0,
    pressure: 1013.2,
    type: 'official',
    icon: createCustomIcon('#3b82f6'), // Blue for officials
    connectedTo: ['2', '3', '4', '5', '6', '7', '8', '9'],
    signalStrength: 95,
    batteryLevel: 100
  },
  {
    id: '2',
    name: 'Survival Kit #1',
    position: [43.0592, -76.1435] as [number, number],
    status: 'Online',
    temperature: 26.0,
    humidity: 55.0,
    pressure: 1012.8,
    type: 'kit',
    icon: createCustomIcon('#10b981'), // Green for survival kits
    connectedTo: ['1', '3', '5', '7'],
    signalStrength: 85,
    batteryLevel: 92
  },
  {
    id: '3',
    name: 'Survival Kit #2',
    position: [43.0483, -76.1586] as [number, number],
    status: 'Online',
    temperature: 24.5,
    humidity: 62.0,
    pressure: 1013.5,
    type: 'kit',
    icon: createCustomIcon('#10b981'), // Green for survival kits
    connectedTo: ['1', '2', '4', '6', '8'],
    signalStrength: 45,
    batteryLevel: 78
  },
  {
    id: '4',
    name: 'Survival Kit #3',
    position: [43.0374, -76.1467] as [number, number],
    status: 'Online',
    temperature: 25.8,
    humidity: 58.0,
    pressure: 1012.5,
    type: 'kit',
    icon: createCustomIcon('#10b981'), // Green for survival kits
    connectedTo: ['1', '3', '5', '9'],
    signalStrength: 75,
    batteryLevel: 88
  },
  {
    id: '5',
    name: 'Survival Kit #4',
    position: [43.0525, -76.1325] as [number, number],
    status: 'Online',
    temperature: 25.2,
    humidity: 59.0,
    pressure: 1013.0,
    type: 'kit',
    icon: createCustomIcon('#10b981'), // Green for survival kits
    connectedTo: ['1', '2', '4', '6', '7'],
    signalStrength: 80,
    batteryLevel: 95
  },
  {
    id: '6',
    name: 'Survival Kit #5',
    position: [43.0436, -76.1625] as [number, number],
    status: 'Online',
    temperature: 24.8,
    humidity: 61.0,
    pressure: 1012.2,
    type: 'kit',
    icon: createCustomIcon('#10b981'), // Green for survival kits
    connectedTo: ['1', '3', '5', '8'],
    signalStrength: 65,
    batteryLevel: 82
  },
  {
    id: '7',
    name: 'Survival Kit #6',
    position: [43.0625, -76.1525] as [number, number],
    status: 'Online',
    temperature: 25.1,
    humidity: 57.0,
    pressure: 1013.8,
    type: 'kit',
    icon: createCustomIcon('#10b981'), // Green for survival kits
    connectedTo: ['1', '2', '5', '8'],
    signalStrength: 70,
    batteryLevel: 90
  },
  {
    id: '8',
    name: 'Survival Kit #7',
    position: [43.0385, -76.1685] as [number, number],
    status: 'Online',
    temperature: 24.3,
    humidity: 63.0,
    pressure: 1011.5,
    type: 'kit',
    icon: createCustomIcon('#10b981'), // Green for survival kits
    connectedTo: ['1', '3', '6', '7', '9'],
    signalStrength: 55,
    batteryLevel: 75
  },
  {
    id: '9',
    name: 'Survival Kit #8',
    position: [43.0275, -76.1385] as [number, number],
    status: 'Online',
    temperature: 25.7,
    humidity: 56.0,
    pressure: 1012.0,
    type: 'kit',
    icon: createCustomIcon('#10b981'), // Green for survival kits
    connectedTo: ['1', '4', '8'],
    signalStrength: 60,
    batteryLevel: 85
  }
];

interface MapProps {
  center?: [number, number];
  zoom?: number;
}

export default function Map({ center = [43.0481, -76.1474], zoom = 13 }: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [deviceData, setDeviceData] = useState<Device[]>(devices);
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
      const alertMessages = [];
      
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
          // Generate new readings with random variations
          const newTemperature = Number((device.temperature + (Math.random() - 0.5)).toFixed(1));
          const newHumidity = Number((device.humidity + (Math.random() - 0.5)).toFixed(1));
          const newPressure = Number((device.pressure + (Math.random() - 0.5)).toFixed(1));
          
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

  // Find the shortest path between two nodes using Dijkstra's algorithm
  const findShortestPath = (startId: string, endId: string): string[] => {
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string } = {};
    const unvisited = new Set<string>();
    
    // Initialize distances
    deviceData.forEach(device => {
      distances[device.id] = Infinity;
      unvisited.add(device.id);
    });
    distances[startId] = 0;
    
    while (unvisited.size > 0) {
      // Find the node with the smallest distance
      let currentId = '';
      let smallestDistance = Infinity;
      
      unvisited.forEach(id => {
        if (distances[id] < smallestDistance) {
          smallestDistance = distances[id];
          currentId = id;
        }
      });
      
      if (currentId === '') break;
      
      // If we've reached the destination, we're done
      if (currentId === endId) break;
      
      unvisited.delete(currentId);
      
      // Update distances to neighbors
      const currentDevice = deviceData.find(d => d.id === currentId);
      if (currentDevice) {
        currentDevice.connectedTo.forEach(neighborId => {
          if (!unvisited.has(neighborId)) return;
          
          const neighbor = deviceData.find(d => d.id === neighborId);
          if (!neighbor || neighbor.status !== 'Online') return;
          
          // Calculate distance based on signal strength (higher signal = lower distance)
          const distance = distances[currentId] + (100 - neighbor.signalStrength) / 10;
          
          if (distance < distances[neighborId]) {
            distances[neighborId] = distance;
            previous[neighborId] = currentId;
          }
        });
      }
    }
    
    // Reconstruct the path
    const path: string[] = [];
    let current = endId;
    
    while (current !== startId) {
      path.unshift(current);
      current = previous[current];
      if (!current) return []; // No path found
    }
    
    path.unshift(startId);
    return path;
  };

  // Function to send alert from command center to all kits
  const sendAlertToAllKits = () => {
    if (!alertMessage.trim()) return;
    
    const commandCenter = deviceData.find(d => d.id === '1');
    if (!commandCenter) return;
    
    const timestamp = new Date().toLocaleTimeString();
    
    // Send alert to each kit
    deviceData.filter(d => d.type === 'kit' && d.status === 'Online').forEach(kit => {
      // Find path from command center to this kit
      const path = findShortestPath('1', kit.id);
      
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
      
      // Simulate message passing with hopping
      if (newActiveConnections.length > 0) {
        // Randomly select a source and destination
        const onlineDevices = deviceData.filter(d => d.status === 'Online');
        if (onlineDevices.length >= 2) {
          const sourceIndex = Math.floor(Math.random() * onlineDevices.length);
          let destIndex = Math.floor(Math.random() * onlineDevices.length);
          
          // Make sure source and destination are different
          while (destIndex === sourceIndex) {
            destIndex = Math.floor(Math.random() * onlineDevices.length);
          }
          
          const sourceDevice = onlineDevices[sourceIndex];
          const destDevice = onlineDevices[destIndex];
          
          // Find the path between source and destination
          const path = findShortestPath(sourceDevice.id, destDevice.id);
          
          if (path.length > 0) {
            // Activate connections along the path
            for (let i = 0; i < path.length - 1; i++) {
              newActiveConnections.push(`${path[i]}-${path[i+1]}`);
            }
            
            // Generate a message
            const messages = [
              "Status update received",
              "Temperature data transmitted",
              "Humidity readings sent",
              "Pressure readings sent",
              "Battery level: 85%",
              "Emergency alert: High temperature detected",
              "Location coordinates updated",
              "Supply inventory: 75%",
              "Medical supplies: 90%",
              "Water reserves: 60%",
              "Food supplies: 80%",
              "Emergency beacon activated",
              "SOS signal sent",
              "Weather conditions: Clear",
              "Radio check: Signal received",
              "Mesh network status: Operational"
            ];
            
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            const timestamp = new Date().toLocaleTimeString();
            
            // Add the message to the log with the path information
            setMessageLog(prev => [
              { 
                from: sourceDevice.name, 
                to: destDevice.name, 
                message: randomMessage, 
                timestamp,
                path: path.length > 2 ? path.map(id => deviceData.find(d => d.id === id)?.name || id) : undefined
              },
              ...prev.slice(0, 9) // Keep only the last 10 messages
            ]);
          }
        }
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [mounted, deviceData]);

  if (!mounted) {
    return <div className="map-loading">Loading map...</div>;
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
        
        {deviceData.map(device => (
          <Marker key={device.id} position={device.position} icon={device.icon}>
            <Popup>
              <div className="popup-content">
                <h3>{device.name}</h3>
                <p className={device.status === 'Online' ? 'status-online' : 'status-offline'}>
                  Status: {device.status}
                </p>
                <p>Type: {device.type === 'official' ? 'Command Center' : 'Survival Kit'}</p>
                <p>Temperature: {device.temperature}°C</p>
                <p>Humidity: {device.humidity}%</p>
                <p>Pressure: {device.pressure} hPa</p>
                <p>Signal Strength: {device.signalStrength.toFixed(0)}%</p>
                <p>Battery Level: {device.batteryLevel.toFixed(0)}%</p>
                {device.lastAlert && (
                  <div className="alert-info">
                    <strong>Last Alert:</strong> {device.lastAlert}
                  </div>
                )}
                {device.lastReading && (
                  <div className="reading-info">
                    <strong>Last Reading:</strong> {device.lastReading}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Alert Panel for Command Center */}
      <div className="alert-panel">
        <h3>Command Center Alert System</h3>
        {!alertMode ? (
          <button 
            className="alert-button"
            onClick={() => setAlertMode(true)}
          >
            Send Alert to All Kits
          </button>
        ) : (
          <div className="alert-input">
            <input
              type="text"
              className="alert-input-field"
              placeholder="Enter alert message..."
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
            />
            <div className="alert-buttons">
              <button 
                className="alert-send-button"
                onClick={sendAlertToAllKits}
              >
                Send Alert
              </button>
              <button 
                className="alert-cancel-button"
                onClick={() => {
                  setAlertMode(false);
                  setAlertMessage('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Threshold Alerts Panel */}
      <div className="threshold-alerts-panel">
        <h3>Threshold Alerts</h3>
        <div className="threshold-alerts-list">
          {thresholdAlerts.length > 0 ? (
            thresholdAlerts.map((alert, index) => (
              <div key={index} className="threshold-alert-item">
                <span className="threshold-alert-time">{alert.timestamp}</span>
                <span className="threshold-alert-device">{alert.deviceName}</span>
                <div className="threshold-readings">
                  {alert.readings.temperature && (
                    <div className={`threshold-reading ${alert.readings.temperature.type}`}>
                      <strong>Temperature:</strong> {alert.readings.temperature.value}°C 
                      ({alert.readings.temperature.type === 'min' ? 'Below' : 'Above'} threshold: {alert.readings.temperature.threshold}°C)
                    </div>
                  )}
                  {alert.readings.humidity && (
                    <div className={`threshold-reading ${alert.readings.humidity.type}`}>
                      <strong>Humidity:</strong> {alert.readings.humidity.value}% 
                      ({alert.readings.humidity.type === 'min' ? 'Below' : 'Above'} threshold: {alert.readings.humidity.threshold}%)
                    </div>
                  )}
                  {alert.readings.pressure && (
                    <div className={`threshold-reading ${alert.readings.pressure.type}`}>
                      <strong>Pressure:</strong> {alert.readings.pressure.value} hPa 
                      ({alert.readings.pressure.type === 'min' ? 'Below' : 'Above'} threshold: {alert.readings.pressure.threshold} hPa)
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-threshold-alerts">No threshold alerts. All readings within normal range.</p>
          )}
        </div>
      </div>
      
      {/* Message Log Panel */}
      <div className="message-log-panel">
        <h3>LORA Mesh Network Messages</h3>
        <div className="message-list">
          {messageLog.length > 0 ? (
            messageLog.map((msg, index) => (
              <div key={index} className="message-item">
                <span className="message-time">{msg.timestamp}</span>
                <span className="message-from">{msg.from} → {msg.to}:</span>
                <span className="message-text">{msg.message}</span>
                {msg.path && msg.path.length > 2 && (
                  <span className="message-path">
                    Path: {msg.path.join(' → ')}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="no-messages">No messages yet. Waiting for communication...</p>
          )}
        </div>
      </div>
    </div>
  );
} 