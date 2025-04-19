// before:
// import { DivIcon, Icon, IconOptions } from "leaflet";

export interface Device {
  id: string;
  name: string;
  position: [number, number];
  status: "Online" | "Offline";
  temperature: number;
  humidity: number;
  pressure: number;
  type: "official" | "kit";
  connectedTo: string[];
  signalStrength: number;
  batteryLevel: number;

  // add these:
  iconColor: string;
  lastAlert?: string;
  lastReading?: string;
}
