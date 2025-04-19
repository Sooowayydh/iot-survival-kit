// components/MessageLog.tsx
import React from "react";

interface Message {
  from: string;
  to: string;
  message: string;
  timestamp: string;
  path?: string[];
}

interface MessageLogProps {
  messageLog: Message[];
}

export default function MessageLog({ messageLog }: MessageLogProps) {
  return (
    <div className="message-log-panel">
      <h3>Message Log</h3>
      {messageLog.length ? (
        messageLog.map((m, i) => (
          <div key={i} className="message-item">
            <div className="message-header">
              <span className="message-time">{m.timestamp}</span>
              <span className="message-from-to">{m.from} → {m.to}</span>
            </div>
            <div className="message-body">{m.message}</div>
            {m.path && <div className="message-path">Path: {m.path.join(" → ")}</div>}
          </div>
        ))
      ) : (
        <div className="no-messages">No messages yet.</div>
      )}
    </div>
  );
}