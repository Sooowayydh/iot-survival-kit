"use client";

import React, { useEffect, useState, useCallback } from "react";
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
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

// Threshold values
const THRESHOLDS = {
  temperature: { min: 15, max: 30 },
  humidity: { min: 40, max: 80 },
  pressure: { min: 980, max: 1020 },
};

interface Message {
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

type SensorType = keyof typeof THRESHOLDS;

interface ThresholdAlert {
  deviceId: string;
  deviceName: string;
  timestamp: string;
  readings: Partial<Record<SensorType, ThresholdReading>>;
}

export default function Map({
  center = [43.0481, -76.1474] as LatLngTuple,
  zoom = 13,
}: {
  center?: LatLngTuple;
  zoom?: number;
}) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [routePath, setRoutePath] = useState<LatLngTuple[]>([]);
  const [alertMode, setAlertMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [thresholdAlerts, setThresholdAlerts] = useState<ThresholdAlert[]>(
    []
  );
  const [messageLog, setMessageLog] = useState<Message[]>([]);

  // Haversine distance
  const calcGeoDistance = (
    [lat1, lng1]: LatLngTuple,
    [lat2, lng2]: LatLngTuple
  ) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Dijkstra for shortest path
  const findShortestPath = useCallback(
    (startId: string, endId: string): string[] => {
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

  // Threshold check
  const checkThresholds = (dev: Device) => {
    const readings: Partial<Record<SensorType, ThresholdReading>> = {};

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
      setThresholdAlerts((prev) => [
        { deviceId: dev.id, deviceName: dev.name, timestamp: ts, readings },
        ...prev.slice(0, 19),
      ]);
      setMessageLog((prev) => [
        {
          from: dev.name,
          to: "Command Center",
          message: `ALERT: ${Object.values(readings)
            .map((r) => `${r.type} ${r.value}`)
            .join(", ")}`,
          timestamp: ts,
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  // Simulate sensor updates & logs
  useEffect(() => {
    const iv = setInterval(() => {
      setDevices((ds) =>
        ds.map((d) => {
          const upd = {
            ...d,
            temperature: +(d.temperature + (Math.random() - 0.5) * 4).toFixed(1),
            humidity: +(d.humidity + (Math.random() - 0.5) * 4).toFixed(1),
            pressure: +(d.pressure + (Math.random() - 0.5) * 4).toFixed(1),
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
          const pathNames = findShortestPath(cc.id, kit.id).map(
            (id) => devices.find((x) => x.id === id)!.name
          );
          const ts = new Date().toLocaleTimeString();
          setMessageLog((prev) => [
            {
              from: kit.name,
              to: cc.name,
              message: `T:${kit.temperature} H:${kit.humidity}`,
              timestamp: ts,
              path: pathNames,
            },
            ...prev.slice(0, 9),
          ]);
        });
    }, 10000);
    return () => clearInterval(iv);
  }, [devices, findShortestPath]);

  // Broadcast alert to all kits
  const sendAlertToAllKits = () => {
    if (!alertMessage.trim()) return;
    const timestamp = new Date().toLocaleTimeString();
    const commandCenter = devices.find((d) => d.type === "official");
    if (!commandCenter) return;

    devices
      .filter((d) => d.type === "kit" && d.status === "Online")
      .forEach((kit) => {
        const pathIds = findShortestPath(commandCenter.id, kit.id);
        const pathNames = pathIds.map(
          (id) => devices.find((d) => d.id === id)!.name
        );

        setDevices((prev) =>
          prev.map((d) =>
            d.id === kit.id ? { ...d, lastAlert: alertMessage } : d
          )
        );

        setMessageLog((prev) => [
          {
            from: commandCenter.name,
            to: kit.name,
            message: `ALERT: ${alertMessage}`,
            timestamp,
            path: pathNames.length > 1 ? pathNames : undefined,
          },
          ...prev.slice(0, 9),
        ]);

        setTimeout(() => {
          const readingMsg = `Temperature: ${kit.temperature}°C, Humidity: ${kit.humidity}%, Pressure: ${kit.pressure} hPa`;

          setDevices((prev) =>
            prev.map((d) =>
              d.id === kit.id ? { ...d, lastReading: readingMsg } : d
            )
          );

          setMessageLog((prev) => [
            {
              from: kit.name,
              to: commandCenter.name,
              message: readingMsg,
              timestamp: new Date().toLocaleTimeString(),
              path:
                pathNames.length > 1
                  ? [...pathNames].reverse()
                  : undefined,
            },
            ...prev.slice(0, 9),
          ]);
        }, 1000 + Math.random() * 2000);
      });

    setAlertMessage("");
    setAlertMode(false);
  };

  // On kit click: draw route & open popup
  const handleKitClick = (kit: Device) => {
    const official = devices.find((d) => d.type === "official")!;
    const pathIds = findShortestPath(kit.id, official.id);
    setRoutePath(pathIds.map((id) => devices.find((d) => d.id === id)!.position));
  };

  return (
    <div className="map-wrapper">
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
                  {d.lastAlert && (
                    <div className="popup-alert">
                      <strong>Last Alert:</strong> {d.lastAlert}
                    </div>
                  )}
                  {d.lastReading && (
                    <div className="popup-reading">
                      <strong>Last Reading:</strong> {d.lastReading}
                    </div>
                  )}
                </div>
              )}
            </Popup>
          </Marker>
        ))}

        {routePath.length > 1 && (
          <Polyline positions={routePath} color="#3b82f6" />
        )}
      </MapContainer>

      {/* Alert Panel */}
      <div className="alert-panel">
        <h3>Command Center Alert System</h3>
        {!alertMode ? (
          <button onClick={() => setAlertMode(true)}>
            Send Alert to All Kits
          </button>
        ) : (
          <div className="alert-input">
            <input
              type="text"
              placeholder="Enter alert message..."
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
            />
            <button onClick={sendAlertToAllKits}>Send</button>
            <button
              onClick={() => {
                setAlertMode(false);
                setAlertMessage("");
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Threshold Alerts */}
      <div className="threshold-alerts-panel">
        <h3>Threshold Alerts</h3>
        {thresholdAlerts.length ? (
          thresholdAlerts.map((a, i) => (
            <div key={i} className="alert-item">
              <div className="alert-info">
                <span className="alert-device">{a.deviceName}</span>
                <span className="alert-time">{a.timestamp}</span>
              </div>
              <div className="alert-values">
                {Object.entries(a.readings).map(([k, r]) =>
                  r ? (
                    <span
                      key={k}
                      className={`alert-value ${r.type}`}
                    >
                      {k}: {r.value}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-alerts">No threshold alerts.</div>
        )}
      </div>

      {/* Message Log */}
      <div className="message-log-panel">
        <h3>Message Log</h3>
        {messageLog.length ? (
          messageLog.map((m, i) => (
            <div key={i} className="message-item">
              <div className="message-header">
                <span className="message-time">{m.timestamp}</span>
                <span className="message-from-to">
                  {m.from} → {m.to}
                </span>
              </div>
              <div className="message-body">{m.message}</div>
              {m.path && (
                <div className="message-path">
                  Path: {m.path.join(" → ")}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-messages">No messages yet.</div>
        )}
      </div>
    </div>
  );
}
