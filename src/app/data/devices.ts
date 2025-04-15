import { Device } from '../types';

// Define threshold values for alerts
export const THRESHOLDS = {
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

// Sample device data with more nodes
export const devices: Device[] = [
  {
    id: '1',
    name: 'Command Center',
    position: [43.0481, -76.1474] as [number, number],
    status: 'Online',
    temperature: 25.5,
    humidity: 60.0,
    pressure: 1013.2,
    type: 'official',
    connectedTo: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
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
    connectedTo: ['1', '3', '5', '7', '10', '12'],
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
    connectedTo: ['1', '2', '4', '6', '8', '11', '13'],
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
    connectedTo: ['1', '3', '5', '9', '12', '14'],
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
    connectedTo: ['1', '2', '4', '6', '7', '10', '15'],
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
    connectedTo: ['1', '3', '5', '8', '11'],
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
    connectedTo: ['1', '2', '5', '8', '10'],
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
    connectedTo: ['1', '3', '6', '7', '9', '13'],
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
    connectedTo: ['1', '4', '8', '14'],
    signalStrength: 60,
    batteryLevel: 85
  },
  {
    id: '10',
    name: 'Survival Kit #9',
    position: [43.0675, -76.1425] as [number, number],
    status: 'Online',
    temperature: 24.9,
    humidity: 58.5,
    pressure: 1012.7,
    type: 'kit',
    connectedTo: ['1', '2', '5', '7', '11', '15'],
    signalStrength: 72,
    batteryLevel: 87
  },
  {
    id: '11',
    name: 'Survival Kit #10',
    position: [43.0335, -76.1725] as [number, number],
    status: 'Online',
    temperature: 25.3,
    humidity: 60.5,
    pressure: 1011.8,
    type: 'kit',
    connectedTo: ['1', '3', '6', '10', '13'],
    signalStrength: 63,
    batteryLevel: 79
  },
  {
    id: '12',
    name: 'Survival Kit #11',
    position: [43.0425, -76.1325] as [number, number],
    status: 'Online',
    temperature: 24.7,
    humidity: 62.5,
    pressure: 1013.1,
    type: 'kit',
    connectedTo: ['1', '2', '4', '9', '14'],
    signalStrength: 68,
    batteryLevel: 91
  },
  {
    id: '13',
    name: 'Survival Kit #12',
    position: [43.0575, -76.1625] as [number, number],
    status: 'Online',
    temperature: 25.4,
    humidity: 57.5,
    pressure: 1012.3,
    type: 'kit',
    connectedTo: ['1', '3', '8', '11', '15'],
    signalStrength: 58,
    batteryLevel: 83
  },
  {
    id: '14',
    name: 'Survival Kit #13',
    position: [43.0325, -76.1525] as [number, number],
    status: 'Online',
    temperature: 24.6,
    humidity: 61.5,
    pressure: 1011.9,
    type: 'kit',
    connectedTo: ['1', '4', '9', '12'],
    signalStrength: 52,
    batteryLevel: 77
  },
  {
    id: '15',
    name: 'Survival Kit #14',
    position: [43.0525, -76.1725] as [number, number],
    status: 'Online',
    temperature: 25.6,
    humidity: 59.5,
    pressure: 1012.6,
    type: 'kit',
    connectedTo: ['1', '5', '10', '13'],
    signalStrength: 67,
    batteryLevel: 89
  }
];

// Helper function to find the shortest path between two nodes using Dijkstra's algorithm
export const findShortestPath = (startId: string, endId: string, deviceData: Device[]): string[] => {
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