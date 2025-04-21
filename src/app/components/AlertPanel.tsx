// src/app/components/AlertPanel.tsx
"use client";
import React from "react";

export interface AlertPanelProps {
  alertMode: boolean;
  alertMessage: string;
  onActivate: () => void;
  onMessageChange: (msg: string) => void;
  onSend: () => void;
  onCancel: () => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  alertMode,
  alertMessage,
  onActivate,
  onMessageChange,
  onSend,
  onCancel,
}) => (
  <div className="alert-panel">
    <h3>Command Center Alert System</h3>
    {!alertMode ? (
      <button onClick={onActivate}>Send Alert to All Kits</button>
    ) : (
      <div className="alert-input">
        <input
          type="text"
          placeholder="Enter alert message..."
          value={alertMessage}
          onChange={(e) => onMessageChange(e.target.value)}
        />
        <button onClick={onSend}>Send</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    )}
  </div>
);
