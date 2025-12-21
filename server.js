import express from "express";
import WebSocket from "ws";

const app = express();
const server = app.listen(process.env.PORT || 3000);
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("message", (msg) => {
    // Broadcast message to everyone
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg.toString());
      }
    });
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

console.log("WebSocket server running");
