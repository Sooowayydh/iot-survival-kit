// src/app/components/MessageLogPanel.tsx
"use client";
import React from "react";

export interface Message {
  from: string;
  to: string;
  message: string;
  timestamp: string;
  path?: string[];
}

export interface MessageLogPanelProps {
  logs: Message[];
}

export const MessageLogPanel: React.FC<MessageLogPanelProps> = ({ logs }) => (
  <div className="message-log-panel">
    <h3>Message Log</h3>
    {logs.length ? (
      logs.map((m, i) => {
        const parts = m.message.split(" ");
        const tempPart = parts.find((p) => p.startsWith("T:"));
        const humPart = parts.find((p) => p.startsWith("H:"));
        const isSensor = tempPart && humPart;

        return (
          <div key={i} className="message-item">
            <div className="message-header">
              <span className="message-time">{m.timestamp}</span>
              <span className="message-from-to">
                {m.from} → {m.to}
              </span>
            </div>
            <div className="message-body">
              {isSensor ? (
                <>
                  <div>Temperature: {tempPart!.slice(2)}°C</div>
                  <div>Humidity: {humPart!.slice(2)}%</div>
                </>
              ) : (
                <div>{m.message}</div>
              )}
            </div>
            {m.path && (
              <div className="message-path">
                Path: {m.path.slice().reverse().join(" → ")}
              </div>
            )}
          </div>
        );
      })
    ) : (
      <div className="no-messages">No messages yet.</div>
    )}
  </div>
);
