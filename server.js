import WebSocket from "ws";
import express from "express";
import fetch from "node-fetch";

const app = express();
const server = app.listen(3000);
const wss = new WebSocket.Server({ server });

const users = new Map(); // userId -> { ws, fcmToken }

const FCM_KEY = "YOUR_FIREBASE_SERVER_KEY";

wss.on("connection", (ws) => {
  let userId = null;

  ws.on("message", async (msg) => {
    const data = JSON.parse(msg);

    // User joins
    if (data.type === "join") {
      userId = data.userId;
      users.set(userId, { ws, fcmToken: data.fcmToken });
      return;
    }

    // New message
    if (data.type === "message") {
      const bubble = {
        id: Date.now(),
        text: data.text,
        x: Math.random() * 300,
        y: Math.random() * 600
      };

      // Send to online users
      users.forEach((u) => {
        if (u.ws.readyState === WebSocket.OPEN) {
          u.ws.send(JSON.stringify({ type: "bubble", bubble }));
        }
      });

      // Notify offline users
      users.forEach((u) => {
        if (u.ws.readyState !== WebSocket.OPEN && u.fcmToken) {
          sendPush(u.fcmToken, data.text);
        }
      });
    }
  });

  ws.on("close", () => {
    if (userId) users.delete(userId);
  });
});

async function sendPush(token, text) {
  await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Authorization": `key=${FCM_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: token,
      notification: {
        title: "New Bubble 💬",
        body: text
      }
    })
  });
}

