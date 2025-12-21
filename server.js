const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bubble Chat Server is running!');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Broadcast message to all connected clients
function broadcast(data, sender) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);

    // Send welcome message
    ws.send(JSON.stringify({
        user: 'Server',
        message: 'Welcome to Bubble Chat! 🎉',
        type: 'text'
    }));

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const parsed = JSON.parse(data);
            console.log(`Received from ${parsed.user}: ${parsed.type === 'drawing' ? 'drawing' : parsed.message}`);
            
            // Broadcast to all clients
            broadcast(parsed, ws);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    // Handle client disconnect
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Bubble Chat server is running on port ${PORT}`);
    console.log(`WebSocket server is ready for connections`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
