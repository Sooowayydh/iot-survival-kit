
// components/ThresholdAlerts.tsx
import React from "react";

interface Reading {
  value: number;
  threshold: number;
  type: "min" | "max";
}
interface ThresholdAlert {
  deviceId: string;
  deviceName: string;
  timestamp: string;
  readings: Partial<Record<"temperature" | "humidity" | "pressure", Reading>>;
}

interface ThresholdAlertsProps {
  thresholdAlerts: ThresholdAlert[];
}

export default function ThresholdAlerts({ thresholdAlerts }: ThresholdAlertsProps) {
  return (
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
              {Object.entries(a.readings).map(([k, r]) => (
                <span key={k} className={`alert-value ${r!.type}`}>
                  {k}: {r!.value}
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
}
