import express from "express";
import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 3000;

// Render needs an HTTP server
const server = app.listen(PORT, () => {
  console.log("HTTP server running on", PORT);
});

// Attach WebSocket to same server
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on("connection", (ws) => {
  console.log("🟢 client connected");
  clients.add(ws);

  ws.on("message", (data) => {
    console.log("📩", data.toString());

    // Broadcast message
    for (const client of clients) {
      if (client.readyState === ws.OPEN) {
        client.send(data.toString());
      }
    }
  });

  ws.on("close", () => {
    console.log("🔴 client disconnected");
    clients.delete(ws);
  });
});
