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
import { getDevices } from "./devices";
import { SENSOR_THRESHOLDS } from "./thingspeak";

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
  unit?: string;
}

export interface ThresholdAlert {
  deviceId: string;
  deviceName: string;
  timestamp: string;
  readings: Partial<Record<keyof typeof SENSOR_THRESHOLDS, ThresholdReading>>;
  fullReadings: string;
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

// Helper to get units
function getUnitForSensor(sensor: string): string {
  switch (sensor) {
    case "temperature":
      return "°C";
    case "humidity":
      return "%";
    case "pressure":
      return " hPa";
    case "airQuality":
      return " IAQ";
    case "coLevel":
    case "combustibleGas":
      return " ppm";
    case "waterQuality":
      return " ppm";
    default:
      return "";
  }
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
    const [devices, setDevices] = useState<Device[]>([]);
    const [routePath, setRoutePath] = useState<LatLngTuple[]>([]);

    // Check thresholds
    const checkThresholds = useCallback(
      (dev: Device) => {
        const readings: Partial<
          Record<keyof typeof SENSOR_THRESHOLDS, ThresholdReading>
        > = {};

        Object.entries(SENSOR_THRESHOLDS).forEach(([sensor, { min, max }]) => {
          const value = dev[sensor as keyof Device] as number;
          if (value < min) {
            readings[sensor as keyof typeof SENSOR_THRESHOLDS] = {
              value,
              threshold: min,
              type: "min",
              unit: getUnitForSensor(sensor),
            };
          } else if (value > max) {
            readings[sensor as keyof typeof SENSOR_THRESHOLDS] = {
              value,
              threshold: max,
              type: "max",
              unit: getUnitForSensor(sensor),
            };
          }
        });

        if (Object.keys(readings).length > 0) {
          const ts = new Date().toLocaleTimeString();
          const fullReadings = Object.entries(SENSOR_THRESHOLDS)
            .map(([sensor]) => {
              const v = dev[sensor as keyof Device] as number;
              const u = getUnitForSensor(sensor);
              return `${sensor}: ${v}${u}`;
            })
            .join(", ");

          const alertPayload: ThresholdAlert = {
            deviceId: dev.id,
            deviceName: dev.name,
            timestamp: ts,
            readings,
            fullReadings,
          };
          const msgPayload: Message = {
            from: dev.name,
            to: "Command Center",
            message: fullReadings,
            timestamp: ts,
          };

          setTimeout(() => onThresholdAlert?.(alertPayload), 0);
          setTimeout(() => onNewMessage?.(msgPayload), 0);
        }
      },
      [onThresholdAlert, onNewMessage]
    );

    // Fetch devices and run checks
    const fetchDevices = useCallback(async () => {
      try {
        const updated = await getDevices();
        setDevices(updated);
        updated.forEach((d) => {
          if (d.type === "kit") checkThresholds(d);
        });
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    }, [checkThresholds]);

    useEffect(() => {
      fetchDevices();
      const iv = setInterval(fetchDevices, 30000);
      return () => clearInterval(iv);
    }, [fetchDevices]);

    // Distance helper
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

    // Dijkstra’s for routing
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
              dist[current] +
              calcGeoDistance(cd.position, neighbor.position);
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

    // Broadcast alert
    const sendAlertToAllKits = useCallback(
      (message: string) => {
        if (!message.trim()) return;
        const ts = new Date().toLocaleTimeString();
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
              timestamp: ts,
              path: pathNames.length > 1 ? pathNames : undefined,
            });

            setTimeout(() => {
              const readingMsg = [
                `Temperature: ${kit.temperature}°C`,
                `Humidity: ${kit.humidity}%`,
                `Pressure: ${kit.pressure} hPa`,
                `Air Quality: ${kit.airQuality} IAQ`,
                `CO Level: ${kit.coLevel} ppm`,
                `Gas: ${kit.combustibleGas} ppm`,
                `Water: ${kit.waterQuality} ppm`,
              ].join(", ");
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

    useImperativeHandle(
      ref,
      () => ({ sendAlert: sendAlertToAllKits }),
      [sendAlertToAllKits]
    );

    // Simulate periodic updates
    useEffect(() => {
      const iv = setInterval(() => {
        setDevices((prev) => {
          const updated = prev.map((d) => {
            if (d.id === "4") return d;
            const temp = +(d.temperature + (Math.random() - 0.5) * 4).toFixed(1);
            const hum = +(d.humidity + (Math.random() - 0.5) * 4).toFixed(1);
            const pres = +(d.pressure + (Math.random() - 0.5) * 4).toFixed(1);
            const newDev = { ...d, temperature: temp, humidity: hum, pressure: pres };
            if (d.type === "kit") checkThresholds(newDev);
            return newDev;
          });

          const cc = updated.find((d) => d.type === "official");
          if (cc) {
            updated
              .filter((d) => d.type === "kit")
              .forEach((kit) => {
                const pathIds = findShortestPath(cc.id, kit.id);
                const pathNames = pathIds.map(
                  (id) => updated.find((dd) => dd.id === id)!.name
                );
                const tmsg = [
                  `Temperature: ${kit.temperature}°C`,
                  `Humidity: ${kit.humidity}%`,
                  `Pressure: ${kit.pressure} hPa`,
                  `Air Quality: ${kit.airQuality} IAQ`,
                  `CO Level: ${kit.coLevel} ppm`,
                  `Gas: ${kit.combustibleGas} ppm`,
                  `Water: ${kit.waterQuality} ppm`,
                ].join(", ");
                onNewMessage?.({
                  from: kit.name,
                  to: cc.name,
                  message: tmsg,
                  timestamp: new Date().toLocaleTimeString(),
                  path: pathNames,
                });
              });
          }

          return updated;
        });
      }, 10000);
      return () => clearInterval(iv);
    }, [checkThresholds, findShortestPath, onNewMessage]);

    // Draw route on click
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
                  <div>Air Quality: {d.airQuality} IAQ</div>
                  <div>CO Level: {d.coLevel} ppm</div>
                  <div>Combustible Gas: {d.combustibleGas} ppm</div>
                  <div>Water Quality: {d.waterQuality} ppm</div>
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

Map.displayName = "Map";

export default Map;
