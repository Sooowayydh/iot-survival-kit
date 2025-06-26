// src/app/components/ThresholdAlertsPanel.tsx
"use client";

import React from "react";

interface ThresholdReading {
  value: number;
  threshold: number;
  type: "min" | "max";
}

export interface ThresholdAlert {
  deviceId: string;
  deviceName: string;
  timestamp: string;
  readings: Partial<Record<string, ThresholdReading>>;
  fullReadings: string;
}

export interface ThresholdAlertsPanelProps {
  alerts: ThresholdAlert[];
}

export const ThresholdAlertsPanel: React.FC<ThresholdAlertsPanelProps> = ({ alerts }) => (
  <div className="threshold-alerts-panel">
    <h3>Threshold Alerts</h3>
    {alerts.length ? (
      alerts.map((a, i) => (
        <div key={i} className="alert-item">
          <div className="alert-info">
            <span className="alert-device">{a.deviceName}</span>
            <span className="alert-time">{a.timestamp}</span>
          </div>
          <div className="alert-values">
            {Object.entries(a.readings).map(([k, r]) =>
              r ? (
                <span key={k} className={`alert-value ${r.type}`}>
                  {k}: {r.value}{r.unit || ""}
                </span>
              ) : null
            )}
          </div>
          <div className="alert-values" style={{ marginTop: "8px" }}>
            {a.fullReadings.split(",").map((entry, j) => (
              <span key={j} className="alert-value">
                {entry.trim()}
              </span>
            ))}
          </div>
        </div>
      ))
    ) : (
      <div className="no-alerts">No threshold alerts.</div>
    )}
  </div>
);
