import { DivIcon, Icon, IconOptions } from 'leaflet';

export interface Device {
  id: string;
  name: string;
  position: [number, number];
  temperature: number;
  humidity: number;
  pressure: number;
  connectedTo: string[];
  status: 'Online' | 'Offline';
  type: 'official' | 'kit';
  icon: DivIcon | Icon<IconOptions> | null;
  signalStrength: number;
  batteryLevel: number;
  lastAlert?: string;
  lastReading?: string;
} 