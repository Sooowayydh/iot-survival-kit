export interface Device {
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
  icon?: any; // Make icon optional
  lastAlert?: string;
  lastReading?: string;
} 