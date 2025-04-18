// src/app/components/devices.ts
import { Device } from "../types";


export const devices: Device[] = [
    {
        id: "1",
        name: "Command Center",
        position: [43.0481, -76.1474] as [number, number],
        status: "Online",
        temperature: 25.5,
        humidity: 60.0,
        pressure: 1013.2,
        type: "official",
        iconColor: "#3b82f6",
        connectedTo: ["2", "3", "4"],
        signalStrength: 95,
        batteryLevel: 100,
      },
      {
        id: "2",
        name: "Survival Kit #1",
        position: [43.0592, -76.1435] as [number, number],
        status: "Online",
        temperature: 26.0,
        humidity: 55.0,
        pressure: 1012.8,
        type: "kit",
        iconColor: "#10b981",
        connectedTo: ["1", "3", "5", "7"],
        signalStrength: 85,
        batteryLevel: 92,
      },
      {
        id: "3",
        name: "Survival Kit #2",
        position: [43.0483, -76.1586] as [number, number],
        status: "Online",
        temperature: 24.5,
        humidity: 62.0,
        pressure: 1013.5,
        type: "kit",
        iconColor: "#10b981",
        connectedTo: ["1", "2", "4", "6", "8"],
        signalStrength: 45,
        batteryLevel: 78,
      },
      {
        id: "4",
        name: "Survival Kit #3",
        position: [43.0374, -76.1467] as [number, number],
        status: "Online",
        temperature: 25.8,
        humidity: 58.0,
        pressure: 1012.5,
        type: "kit",
        iconColor: "#10b981",
        connectedTo: ["1", "3", "5", "9"],
        signalStrength: 75,
        batteryLevel: 88,
      },
      {
        id: "5",
        name: "Survival Kit #4",
        position: [43.0525, -76.1325] as [number, number],
        status: "Online",
        temperature: 25.2,
        humidity: 59.0,
        pressure: 1013.0,
        type: "kit",
        iconColor: "#10b981",
        connectedTo: [ "2", "4", "6", "7"],
        signalStrength: 80,
        batteryLevel: 95,
      },
      {
        id: "6",
        name: "Survival Kit #5",
        position: [43.0436, -76.1625] as [number, number],
        status: "Online",
        temperature: 24.8,
        humidity: 61.0,
        pressure: 1012.2,
        type: "kit",
        iconColor: "#10b981",
        connectedTo: ["3", "5", "8"],
        signalStrength: 65,
        batteryLevel: 82,
      },
      {
        id: "7",
        name: "Survival Kit #6",
        position: [43.0625, -76.1525] as [number, number],
        status: "Online",
        temperature: 25.1,
        humidity: 57.0,
        pressure: 1013.8,
        type: "kit",
        iconColor: "#10b981",
        connectedTo: ["2", "5", "8"],
        signalStrength: 70,
        batteryLevel: 90,
      },
      {
        id: "8",
        name: "Survival Kit #7",
        position: [43.0385, -76.1685] as [number, number],
        status: "Online",
        temperature: 24.3,
        humidity: 63.0,
        pressure: 1011.5,
        type: "kit",
        iconColor: "#10b981",
        connectedTo: [ "3", "6", "7", "9"],
        signalStrength: 55,
        batteryLevel: 75,
      },
      {
        id: "9",
        name: "Survival Kit #8",
        position: [43.0275, -76.1385] as [number, number],
        status: "Online",
        temperature: 25.7,
        humidity: 56.0,
        pressure: 1012.0,
        type: "kit",
        iconColor: "#10b981",
        connectedTo: ["4", "8"],
        signalStrength: 60,
        batteryLevel: 85,
      },
];
