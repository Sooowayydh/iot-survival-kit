'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  AlertTriangle, Send, X, Activity, Battery, Wifi, 
  Thermometer, Droplets, Gauge, RefreshCw, Settings 
} from 'lucide-react';

// Dynamically import the Map component with no SSR
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <RefreshCw className="animate-spin mr-2" />
      Loading map...
    </div>
  )
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
  const [alertMode, setAlertMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
              batteryLevel: Math.min(100, Math.max(0, device.batteryLevel - (Math.random() * 0.5))),
              lastReading: new Date().toLocaleTimeString()
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

  const sendAlertToAllKits = () => {
    // Implementation of sending an alert to all kits
    console.log('Alert message:', alertMessage);
    
    // Visual feedback
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setAlertMode(false);
      setAlertMessage('');
      
      // Add confirmation toast or notification here
    }, 1000);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate updating data
      setDevices(prevDevices => {
        return prevDevices.map(device => {
          if (device.status === 'Online') {
            return {
              ...device,
              temperature: Number((device.temperature + (Math.random() - 0.5) * 2).toFixed(1)),
              humidity: Number((device.humidity + (Math.random() - 0.5) * 5).toFixed(1)),
              pressure: Number((device.pressure + (Math.random() - 0.5) * 10).toFixed(1)),
              lastReading: new Date().toLocaleTimeString()
            };
          }
          return device;
        });
      });
      
      setLastUpdated('Just now');
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="flex items-center">
          <h1 className="dashboard-title">Survival Kit Network Dashboard</h1>
        </div>
        <div className="dashboard-stats">
          <div className="stat-card">
            <Activity className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">Active Devices</span>
              <span className="stat-value">{devices.filter(d => d.status === 'Online').length}</span>
            </div>
          </div>
          <div className="stat-card">
            <AlertTriangle className="stat-icon text-amber-500" />
            <div className="stat-content">
              <span className="stat-label">Active Alerts</span>
              <span className="stat-value">{thresholdAlerts.length}</span>
            </div>
          </div>
          <div className="stat-card">
            <Battery className="stat-icon text-green-500" />
            <div className="stat-content">
              <span className="stat-label">Last Updated</span>
              <span className="stat-value">{lastUpdated}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="map-section">
          <Map devices={devices} />
        </div>

        <div className="dashboard-sidebar">
          {selectedDevice && (
            <div className="device-details-panel">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{selectedDevice.name}</h3>
                <span className={`status-indicator ${selectedDevice.status === 'Online' ? 'online' : 'offline'}`}>
                  {selectedDevice.status}
                </span>
              </div>
              
              <div className="readings-grid">
                <div className="reading-card">
                  <Thermometer className="reading-icon text-red-500" />
                  <div>
                    <span className="reading-label">Temperature</span>
                    <span className="reading-value">{selectedDevice.temperature}°C</span>
                  </div>
                </div>
                <div className="reading-card">
                  <Droplets className="reading-icon text-blue-500" />
                  <div>
                    <span className="reading-label">Humidity</span>
                    <span className="reading-value">{selectedDevice.humidity}%</span>
                  </div>
                </div>
                <div className="reading-card">
                  <Gauge className="reading-icon text-purple-500" />
                  <div>
                    <span className="reading-label">Pressure</span>
                    <span className="reading-value">{selectedDevice.pressure} hPa</span>
                  </div>
                </div>
                <div className="reading-card">
                  <Wifi className="reading-icon text-green-500" />
                  <div>
                    <span className="reading-label">Signal</span>
                    <div className="signal-strength">
                      <div className="signal-bar-container">
                        <div className="signal-bar" style={{width: `${selectedDevice.signalStrength}%`}}></div>
                      </div>
                      <span>{selectedDevice.signalStrength}%</span>
                    </div>
                  </div>
                </div>
                <div className="reading-card">
                  <Battery className="reading-icon text-amber-500" />
                  <div>
                    <span className="reading-label">Battery</span>
                    <div className="battery-level">
                      <div className="battery-bar-container">
                        <div 
                          className={`battery-bar ${
                            selectedDevice.batteryLevel > 70 ? 'bg-green-500' : 
                            selectedDevice.batteryLevel > 30 ? 'bg-amber-500' : 'bg-red-500'
                          }`} 
                          style={{width: `${selectedDevice.batteryLevel}%`}}
                        ></div>
                      </div>
                      <span>{selectedDevice.batteryLevel}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="connections-section mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Connected Devices</h4>
                <div className="connections-list">
                  {selectedDevice.connectedTo.map(deviceId => {
                    const connectedDevice = devices.find(d => d.id === deviceId);
                    return connectedDevice ? (
                      <div 
                        key={deviceId} 
                        className={`connection-item ${connectedDevice.status === 'Online' ? 'online' : 'offline'}`}
                      >
                        {connectedDevice.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              
              <button 
                className="close-btn mt-4"
                onClick={() => setSelectedDevice(null)}
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>
          )}
          
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
                    className="send-button"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <RefreshCw className="animate-spin" />
                    ) : (
                      <Send />
                    )}
                    Send
                  </button>
                  <button 
                    onClick={() => setAlertMode(false)}
                    className="cancel-button"
                  >
                    <X />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="threshold-alerts-panel">
            <div className="flex justify-between items-center mb-4">
              <h3>Threshold Alerts</h3>
              <span className="text-sm text-gray-500">
                {thresholdAlerts.length} {thresholdAlerts.length === 1 ? 'alert' : 'alerts'}
              </span>
            </div>
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
                          <Thermometer className="w-4 h-4" />
                          <span>Temperature: {alert.readings.temperature.value}°C</span>
                          <span>({alert.readings.temperature.type === 'min' ? 'Below' : 'Above'} {alert.readings.temperature.threshold}°C)</span>
                        </div>
                      )}
                      {alert.readings.humidity && (
                        <div className={`alert-reading ${alert.readings.humidity.type}`}>
                          <Droplets className="w-4 h-4" />
                          <span>Humidity: {alert.readings.humidity.value}%</span>
                          <span>({alert.readings.humidity.type === 'min' ? 'Below' : 'Above'} {alert.readings.humidity.threshold}%)</span>
                        </div>
                      )}
                      {alert.readings.pressure && (
                        <div className={`alert-reading ${alert.readings.pressure.type}`}>
                          <Gauge className="w-4 h-4" />
                          <span>Pressure: {alert.readings.pressure.value}hPa</span>
                          <span>({alert.readings.pressure.type === 'min' ? 'Below' : 'Above'} {alert.readings.pressure.threshold}hPa)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-alerts">
                  <div className="flex flex-col items-center justify-center p-6">
                    <div className="rounded-full bg-gray-100 p-3 mb-2">
                      <AlertTriangle className="w-6 h-6 text-gray-400" />
                    </div>
                    <p>No active alerts</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}