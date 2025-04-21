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
    <div className="app container mx-auto py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Survival Kit Dashboard</h1>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h2>Location Map</h2>
          </div>
          <div className="card-body p-0">
          <div className="map-wrapper">
                       <Map
              ref={mapRef}
              onThresholdAlert={handleThresholdAlert}
              onNewMessage={handleNewMessage}
            />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <AlertPanel
              alertMode={alertMode}
              alertMessage={alertMessage}
              onActivate={() => setAlertMode(true)}
              onMessageChange={setAlertMessage}
              onSend={() => {
                // THIS is the key: actually call sendAlert on the map
                mapRef.current?.sendAlert(alertMessage);
                setAlertMode(false);
                setAlertMessage("");
              }}
              onCancel={() => {
                setAlertMode(false);
                setAlertMessage("");
              }}
            />
          </div>

          <div className="card">
            <ThresholdAlertsPanel alerts={thresholdAlerts} />
          </div>

          <div className="card">
            <MessageLogPanel logs={messageLog} />
          </div>
        </div>
      </main>
    </div>
  );
}
