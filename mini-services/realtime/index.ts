// Smart Global ERP — Realtime WebSocket Service
// Pushes live updates: new orders, low stock, work order progress, notifications
// Port: 3001

import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3001;

const httpServer = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ service: "Smart Global ERP Realtime", status: "ok", port: PORT }));
});

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Connected clients (ERP frontend users)
const clients = new Map<string, any>();

io.on("connection", (socket) => {
  console.log(`[Realtime] Client connected: ${socket.id}`);

  // Authenticate with tenantId
  socket.on("auth", (data: { tenantId: string; userId: string }) => {
    clients.set(socket.id, data);
    socket.join(`tenant:${data.tenantId}`);
    socket.join(`user:${data.userId}`);
    console.log(`[Realtime] ${socket.id} → tenant ${data.tenantId}, user ${data.userId}`);
  });

  // Subscribe to module-specific channels
  socket.on("subscribe", (channel: string) => {
    socket.join(channel);
  });

  socket.on("disconnect", () => {
    clients.delete(socket.id);
    console.log(`[Realtime] Client disconnected: ${socket.id}`);
  });
});

// Broadcast helpers (called by API routes via internal HTTP)
io.on("connection", (socket) => {
  socket.on("broadcast", (data: { tenantId?: string; userId?: string; event: string; payload: any }) => {
    if (data.userId) {
      io.to(`user:${data.userId}`).emit(data.event, data.payload);
    } else if (data.tenantId) {
      io.to(`tenant:${data.tenantId}`).emit(data.event, data.payload);
    } else {
      io.emit(data.event, data.payload);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Smart Global ERP Realtime Service running on port ${PORT}`);
});

// Heartbeat — emit live metrics every 10 seconds
setInterval(() => {
  io.emit("heartbeat", {
    timestamp: new Date().toISOString(),
    connectedClients: clients.size,
  });
}, 10000);
