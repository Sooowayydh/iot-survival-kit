'use client';

import { useEffect, useState } from 'react';
import { Polyline, useMap } from 'react-leaflet';

interface MeshNode {
  id: string;
  name: string;
  position: [number, number];
  type: 'official' | 'kit';
  status: 'Online' | 'Offline';
  connectedTo: string[];
  signalStrength: number;
}

interface MeshNetworkProps {
  nodes: MeshNode[];
  activeConnections: string[];
}

export default function MeshNetwork({ nodes, activeConnections }: MeshNetworkProps) {
  const map = useMap();
  const [connections, setConnections] = useState<{from: string, to: string, active: boolean}[]>([]);
  
  // Generate connections between nodes
  useEffect(() => {
    const mapCenter = map.getCenter();
    console.log(`Map center: ${mapCenter.lat}, ${mapCenter.lng}`);
    
    const newConnections: {from: string, to: string, active: boolean}[] = [];
    
    // Connect command center to all survival kits
    const commandCenter = nodes.find(node => node.type === 'official');
    if (commandCenter) {
      nodes.forEach(node => {
        if (node.type === 'kit') {
          newConnections.push({
            from: commandCenter.id,
            to: node.id,
            active: activeConnections.includes(`${commandCenter.id}-${node.id}`)
          });
        }
      });
    }
    
    // Connect survival kits to each other (mesh network)
    nodes.filter(node => node.type === 'kit').forEach((kit, index, kits) => {
      // Connect to next kit in the array (circular)
      const nextKit = kits[(index + 1) % kits.length];
      newConnections.push({
        from: kit.id,
        to: nextKit.id,
        active: activeConnections.includes(`${kit.id}-${nextKit.id}`)
      });
    });
    
    setConnections(newConnections);
  }, [nodes, activeConnections, map]);
  
  // Get node position by ID
  const getNodePosition = (id: string): [number, number] => {
    const node = nodes.find(n => n.id === id);
    return node ? node.position : [0, 0];
  };
  
  // Create a pulsing effect for active connections
  const getLineStyle = (active: boolean) => {
    return {
      color: active ? '#3b82f6' : '#94a3b8',
      weight: active ? 3 : 1,
      opacity: active ? 0.8 : 0.3,
      dashArray: active ? '5, 10' : '5, 5',
      animate: active
    };
  };
  
  return (
    <>
      {connections.map((connection, index) => {
        const fromPos = getNodePosition(connection.from);
        const toPos = getNodePosition(connection.to);
        
        return (
          <Polyline
            key={`${connection.from}-${connection.to}-${index}`}
            positions={[fromPos, toPos]}
            pathOptions={getLineStyle(connection.active)}
          />
        );
      })}
    </>
  );
} 