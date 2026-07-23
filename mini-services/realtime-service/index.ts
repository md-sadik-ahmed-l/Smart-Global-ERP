// Smart Global ERP — Realtime WebSocket Service
// Port: 3003
// Handles: live notifications, dashboard updates, production monitoring, order status changes

import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const PORT = 3003;
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/",
});

// In-memory state for connected clients and rooms (per-tenant)
const connectedClients = new Map<string, any>();

io.on("connection", (socket) => {
  console.log(`[Realtime] Client connected: ${socket.id}`);

  // Authenticate + join tenant room
  socket.on("auth", (data: { tenantId: string; userId: string; role: string }) => {
    if (!data?.tenantId || !data?.userId) {
      socket.emit("error", { message: "Invalid auth data" });
      return;
    }
    socket.join(`tenant:${data.tenantId}`);
    socket.join(`user:${data.userId}`);
    if (data.role === "SUPER_ADMIN" || data.role === "CEO") {
      socket.join(`tenant:${data.tenantId}:executives`);
    }
    connectedClients.set(socket.id, data);
    socket.emit("auth:ok", { message: "Connected to realtime service" });
    console.log(`[Realtime] ${socket.id} joined tenant:${data.tenantId} as ${data.role}`);
  });

  // Live notification broadcast
  socket.on("notification:send", (data: { tenantId: string; recipientId?: string; type: string; title: string; message: string }) => {
    if (data.recipientId) {
      io.to(`user:${data.recipientId}`).emit("notification:new", data);
    } else {
      io.to(`tenant:${data.tenantId}`).emit("notification:new", data);
    }
  });

  // Dashboard metric update (e.g., new order, payment received)
  socket.on("dashboard:update", (data: { tenantId: string; metric: string; value: any }) => {
    socket.to(`tenant:${data.tenantId}:executives`).emit("dashboard:metric", data);
  });

  // Production line status update (factory floor monitoring)
  socket.on("production:status", (data: { tenantId: string; workOrderId: string; machineId: string; status: string; output: number }) => {
    socket.to(`tenant:${data.tenantId}`).emit("production:update", data);
  });

  // Order status change
  socket.on("order:status", (data: { tenantId: string; orderId: string; status: string }) => {
    socket.to(`tenant:${data.tenantId}`).emit("order:updated", data);
  });

  // Stock level alert
  socket.on("stock:alert", (data: { tenantId: string; productId: string; warehouseId: string; level: string; currentQty: number }) => {
    socket.to(`tenant:${data.tenantId}`).emit("stock:alert", data);
  });

  // Live chat / messaging
  socket.on("chat:message", (data: { tenantId: string; fromUserId: string; toUserId: string; message: string }) => {
    io.to(`user:${data.toUserId}`).emit("chat:message", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    connectedClients.delete(socket.id);
    console.log(`[Realtime] Client disconnected: ${socket.id}`);
  });
});

// REST endpoint for internal services to push events
import { createServer as createRestServer } from "http";

httpServer.listen(PORT, () => {
  console.log(`[Smart ERP Realtime] WebSocket service running on port ${PORT}`);
  console.log(`[Smart ERP Realtime] Events: notifications, dashboard, production, orders, stock, chat`);
});

export { io };
