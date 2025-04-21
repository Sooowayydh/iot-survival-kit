// src/app/components/Map.tsx
"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import { Device } from "../types";
import { devices as initialDevices } from "./devices";

// Icon factory: colored circle
const createCustomIcon = (color: string) =>
  L.divIcon({
    className: "custom-icon",
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

// Threshold values
const THRESHOLDS = {
  temperature: { min: 15, max: 30 },
  humidity: { min: 40, max: 80 },
  pressure: { min: 980, max: 1020 },
};

export interface Message {
  from: string;
  to: string;
  message: string;
  timestamp: string;
  path?: string[];
}

interface ThresholdReading {
  value: number;
  threshold: number;
  type: "min" | "max";
}

export interface ThresholdAlert {
  deviceId: string;
  deviceName: string;
  timestamp: string;
  readings: Partial<Record<keyof typeof THRESHOLDS, ThresholdReading>>;
}

export interface MapHandle {
  /** Broadcast an alert message to all kits */
  sendAlert: (message: string) => void;
}

interface MapProps {
  center?: LatLngTuple;
  zoom?: number;
  onThresholdAlert?: (alert: ThresholdAlert) => void;
  onNewMessage?: (msg: Message) => void;
}

const Map = forwardRef<MapHandle, MapProps>(
  (
    {
      center = [43.0481, -76.1474] as LatLngTuple,
      zoom = 13,
      onThresholdAlert,
      onNewMessage,
    },
    ref
  ) => {
    const [devices, setDevices] = useState<Device[]>(initialDevices);
    const [routePath, setRoutePath] = useState<LatLngTuple[]>([]);

    // Haversine distance helper
    const calcGeoDistance = (
      [lat1, lng1]: LatLngTuple,
      [lat2, lng2]: LatLngTuple
    ) => {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // Dijkstra’s algorithm
    const findShortestPath = useCallback(
      (startId: string, endId: string) => {
        const dist: Record<string, number> = {};
        const prev: Record<string, string | null> = {};
        const unvisited = new Set<string>();

        devices.forEach((d) => {
          dist[d.id] = Infinity;
          prev[d.id] = null;
          unvisited.add(d.id);
        });
        dist[startId] = 0;

        while (unvisited.size) {
          const current = Array.from(unvisited).reduce((a, b) =>
            dist[a] < dist[b] ? a : b
          );
          if (current === endId || dist[current] === Infinity) break;
          unvisited.delete(current);

          const cd = devices.find((d) => d.id === current);
          cd?.connectedTo.forEach((nid) => {
            if (!unvisited.has(nid)) return;
            const neighbor = devices.find((d) => d.id === nid);
            if (!neighbor || neighbor.status !== "Online") return;
            const alt =
              dist[current] + calcGeoDistance(cd.position, neighbor.position);
            if (alt < dist[nid]) {
              dist[nid] = alt;
              prev[nid] = current;
            }
          });
        }

        const path: string[] = [];
        let u: string | null = endId;
        while (u) {
          path.unshift(u);
          u = prev[u];
        }
        return path[0] === startId ? path : [];
      },
      [devices]
    );

    // Check and emit threshold alerts
    const checkThresholds = useCallback(
      (dev: Device) => {
        const readings: Partial<
          Record<keyof typeof THRESHOLDS, ThresholdReading>
        > = {};

        if (dev.temperature < THRESHOLDS.temperature.min) {
          readings.temperature = {
            value: dev.temperature,
            threshold: THRESHOLDS.temperature.min,
            type: "min",
          };
        } else if (dev.temperature > THRESHOLDS.temperature.max) {
          readings.temperature = {
            value: dev.temperature,
            threshold: THRESHOLDS.temperature.max,
            type: "max",
          };
        }

        if (dev.humidity < THRESHOLDS.humidity.min) {
          readings.humidity = {
            value: dev.humidity,
            threshold: THRESHOLDS.humidity.min,
            type: "min",
          };
        } else if (dev.humidity > THRESHOLDS.humidity.max) {
          readings.humidity = {
            value: dev.humidity,
            threshold: THRESHOLDS.humidity.max,
            type: "max",
          };
        }

        if (dev.pressure < THRESHOLDS.pressure.min) {
          readings.pressure = {
            value: dev.pressure,
            threshold: THRESHOLDS.pressure.min,
            type: "min",
          };
        } else if (dev.pressure > THRESHOLDS.pressure.max) {
          readings.pressure = {
            value: dev.pressure,
            threshold: THRESHOLDS.pressure.max,
            type: "max",
          };
        }

        if (Object.keys(readings).length > 0) {
          const ts = new Date().toLocaleTimeString();
          const alertPayload: ThresholdAlert = {
            deviceId: dev.id,
            deviceName: dev.name,
            timestamp: ts,
            readings,
          };
          const msgPayload: Message = {
            from: dev.name,
            to: "Command Center",
            message: `Alert: ${Object.values(readings)
              .map((r) => `${r.type} ${r.value}`)
              .join(", ")}`,
            timestamp: ts,
          };
          // defer calls so parent state isn't updated during render
          setTimeout(() => onThresholdAlert?.(alertPayload), 0);
          setTimeout(() => onNewMessage?.(msgPayload), 0);
        }
      },
      [onThresholdAlert, onNewMessage]
    );

    // Imperative sendAlert method
    const sendAlertToAllKits = useCallback(
      (message: string) => {
        if (!message.trim()) return;
        const timestamp = new Date().toLocaleTimeString();
        const cc = devices.find((d) => d.type === "official");
        if (!cc) return;

        devices
          .filter((d) => d.type === "kit" && d.status === "Online")
          .forEach((kit) => {
            const pathIds = findShortestPath(cc.id, kit.id);
            const pathNames = pathIds.map(
              (id) => devices.find((d) => d.id === id)!.name
            );

            setDevices((prev) =>
              prev.map((d) =>
                d.id === kit.id ? { ...d, lastAlert: message } : d
              )
            );

            onNewMessage?.({
              from: cc.name,
              to: kit.name,
              message: `ALERT: ${message}`,
              timestamp,
              path: pathNames.length > 1 ? pathNames : undefined,
            });

            // simulate kit response
            setTimeout(() => {
              const readingMsg = `Temperature: ${kit.temperature}°C, Humidity: ${kit.humidity}%, Pressure: ${kit.pressure} hPa`;
              setDevices((prev) =>
                prev.map((d) =>
                  d.id === kit.id ? { ...d, lastReading: readingMsg } : d
                )
              );
              onNewMessage?.({
                from: kit.name,
                to: cc.name,
                message: readingMsg,
                timestamp: new Date().toLocaleTimeString(),
                path:
                  pathNames.length > 1
                    ? [...pathNames].reverse()
                    : undefined,
              });
            }, 1000 + Math.random() * 2000);
          });
      },
      [devices, findShortestPath, onNewMessage]
    );

    // expose sendAlert via ref
    useImperativeHandle(ref, () => ({ sendAlert: sendAlertToAllKits }), [
      sendAlertToAllKits,
    ]);

    // simulate metrics & kit→CC messages
    useEffect(() => {
      const iv = setInterval(() => {
        setDevices((ds) =>
          ds.map((d) => {
            const upd = {
              ...d,
              temperature: +(
                d.temperature +
                (Math.random() - 0.5) * 4
              ).toFixed(1),
              humidity: +((d.humidity + (Math.random() - 0.5) * 4).toFixed(1)),
              pressure: +((d.pressure + (Math.random() - 0.5) * 4).toFixed(1)),
            };
            if (d.type === "kit") checkThresholds(upd);
            return upd;
          })
        );

        const cc = devices.find((d) => d.type === "official");
        if (!cc) return;

        devices
          .filter((d) => d.type === "kit")
          .forEach((kit) => {
            const pathIds = findShortestPath(cc.id, kit.id);
            const pathNames = pathIds.map(
              (id) => devices.find((d) => d.id === id)!.name
            );
            const ts = new Date().toLocaleTimeString();
            setTimeout(
              () =>
                onNewMessage?.({
                  from: kit.name,
                  to: cc.name,
                  message: `T:${kit.temperature} H:${kit.humidity}`,
                  timestamp: ts,
                  path: pathNames,
                }),
              0
            );
          });
      }, 10000);
      return () => clearInterval(iv);
    }, [devices, findShortestPath, checkThresholds, onNewMessage]);

    // kit click → draw route
    const handleKitClick = (kit: Device) => {
      const cc = devices.find((d) => d.type === "official");
      if (!cc) return;
      const ids = findShortestPath(kit.id, cc.id);
      setRoutePath(ids.map((id) => devices.find((d) => d.id === id)!.position));
    };

    return (
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "60vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {devices.map((d) => (
          <Marker
            key={d.id}
            position={d.position}
            icon={createCustomIcon(d.iconColor)}
            eventHandlers={{ click: () => handleKitClick(d) }}
          >
            <Popup>
              <strong>{d.name}</strong>
              <br />
              {d.type === "official" ? (
                "Command Center"
              ) : (
                <div className="popup-content">
                  <div className="popup-title">Survival Kit</div>
                  <div>Temperature: {d.temperature}°C</div>
                  <div>Humidity: {d.humidity}%</div>
                  <div>Pressure: {d.pressure} hPa</div>
                  <div>Signal Strength: {d.signalStrength}%</div>
                  <div>Battery Level: {d.batteryLevel}%</div>
                </div>
              )}
            </Popup>
          </Marker>
        ))}

        {routePath.length > 1 && <Polyline positions={routePath} color="#3b82f6" />}
      </MapContainer>
    );
  }
);

export default Map;
