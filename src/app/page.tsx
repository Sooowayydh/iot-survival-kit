// src/app/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useCallback } from "react";
import { AlertPanel } from "./components/AlertPanel";
import { ThresholdAlertsPanel, ThresholdAlert } from "./components/ThresholdAlertsPanel";
import { MessageLogPanel, Message } from "./components/MessageLogPanel";
import type { MapHandle } from "./components/Map";
import "./styles/Dashboard.css"
const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => <div className="map-loading">Loading map…</div>,
});

export default function Home() {
  const mapRef = useRef<MapHandle>(null);
  const [alertMode, setAlertMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [thresholdAlerts, setThresholdAlerts] = useState<ThresholdAlert[]>([]);
  const [messageLog, setMessageLog] = useState<Message[]>([]);

  const handleThresholdAlert = useCallback((a: ThresholdAlert) => {
    setThresholdAlerts((prev) => [a, ...prev].slice(0, 20));
  }, []);

  const handleNewMessage = useCallback((m: Message) => {
    setMessageLog((prev) => [m, ...prev].slice(0, 10));
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Survival Kit Dashboard</h1>
      </header>

      <main>
        <div className="top-section">
          <div className="map-section">
            <h2>Location Map</h2>
            <div className="map-wrapper">
              <Map
                ref={mapRef}
                onThresholdAlert={handleThresholdAlert}
                onNewMessage={handleNewMessage}
              />
            </div>
          </div>

          <div className="right-column">
            <AlertPanel
              alertMode={alertMode}
              alertMessage={alertMessage}
              onActivate={() => setAlertMode(true)}
              onMessageChange={setAlertMessage}
              onSend={() => {
                mapRef.current?.sendAlert(alertMessage);
                setAlertMode(false);
                setAlertMessage("");
              }}
              onCancel={() => {
                setAlertMode(false);
                setAlertMessage("");
              }}
            />

            <ThresholdAlertsPanel alerts={thresholdAlerts} />
          </div>
        </div>

        <MessageLogPanel logs={messageLog} />
      </main>
    </div>
  );
}

