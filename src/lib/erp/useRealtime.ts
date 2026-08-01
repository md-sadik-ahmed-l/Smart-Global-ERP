"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useRealtime(tenantId?: string, userId?: string) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!tenantId || !userId) return;

    let socket: Socket;
    try {
      socket = io("http://localhost:3001", {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 3,
        timeout: 8000,
      });
    } catch {
      return;
    }
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("auth", { tenantId, userId });
    });

    socket.on("connect_error", () => {
      setConnected(false);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("heartbeat", (data) => setLastEvent({ type: "heartbeat", ...data }));
    socket.on("dashboard_update", (data) => setLastEvent({ type: "dashboard_update", ...data }));
    socket.on("new_order", (data) => setLastEvent({ type: "new_order", ...data }));
    socket.on("low_stock", (data) => setLastEvent({ type: "low_stock", ...data }));
    socket.on("work_order_progress", (data) => setLastEvent({ type: "work_order_progress", ...data }));
    socket.on("notification", (data) => setLastEvent({ type: "notification", ...data }));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tenantId, userId]);

  return { connected, lastEvent };
}
