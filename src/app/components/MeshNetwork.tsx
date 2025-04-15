'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Device } from '../types';
import { findShortestPath } from '../data/devices';
import '../styles/Map.css';

interface MeshNetworkProps {
  nodes: Device[];
  activeConnections: string[];
}

export default function MeshNetwork({ nodes, activeConnections }: MeshNetworkProps) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match map container
    const updateCanvasSize = () => {
      const mapContainer = map.getContainer();
      canvas.width = mapContainer.clientWidth;
      canvas.height = mapContainer.clientHeight;
    };
    
    updateCanvasSize();
    
    // Update canvas size when map is resized
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(map.getContainer());
    
    // Animation function to draw connections
    const animate = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      activeConnections.forEach(connection => {
        const [fromId, toId] = connection.split('-');
        const fromNode = nodes.find(n => n.id === fromId);
        const toNode = nodes.find(n => n.id === toId);
        
        if (fromNode && toNode) {
          const fromPoint = map.latLngToContainerPoint(fromNode.position);
          const toPoint = map.latLngToContainerPoint(toNode.position);
          
          // Draw line with gradient
          const gradient = ctx.createLinearGradient(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)'); // Blue with 50% opacity
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.5)'); // Green with 50% opacity
          
          ctx.beginPath();
          ctx.moveTo(fromPoint.x, fromPoint.y);
          ctx.lineTo(toPoint.x, toPoint.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw animated dots along the path
          const time = Date.now() / 1000;
          const dotCount = 3;
          
          for (let i = 0; i < dotCount; i++) {
            const t = ((time + i / dotCount) % 1);
            const x = fromPoint.x + (toPoint.x - fromPoint.x) * t;
            const y = fromPoint.y + (toPoint.y - fromPoint.y) * t;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'; // Blue with 80% opacity
            ctx.fill();
          }
        }
      });
      
      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [map, nodes, activeConnections]);
  
  return (
    <canvas
      ref={canvasRef}
      className="mesh-network-canvas"
    />
  );
} 