import express from "express";
import WebSocket from "ws";

const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT);

const wss = new WebSocket.Server({ server });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("message", (data) => {
    // Broadcast to everyone
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

console.log("✅ WebSocket server running on port", PORT);
