// components/AlertSystem.tsx
import React from "react";

interface AlertSystemProps {
  alertMode: boolean;
  setAlertMode: React.Dispatch<React.SetStateAction<boolean>>;
  alertMessage: string;
  setAlertMessage: React.Dispatch<React.SetStateAction<string>>;
  sendAlertToAllKits: () => void;
}

export default function AlertSystem({
  alertMode,
  setAlertMode,
  alertMessage,
  setAlertMessage,
  sendAlertToAllKits,
}: AlertSystemProps) {
  return (
    <div className="alert-panel">
      <h3>Command Center Alert System</h3>
      {!alertMode ? (
        <button onClick={() => setAlertMode(true)}>Send Alert to All Kits</button>
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
  );
}
