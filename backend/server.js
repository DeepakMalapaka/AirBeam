const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3001 });

let clients = {};
let nextId = 1;

wss.on("connection", (ws) => {
  ws.id = nextId++;
  clients[ws.id] = ws;

  console.log(`New client connected: ${ws.id}`);

  // Send ID immediately
  ws.send(
    JSON.stringify({
      type: "your-id",
      id: ws.id,
    })
  );

  // Broadcast client list AFTER sending ID
  setTimeout(() => {
    broadcastClients();
  }, 50);

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    console.log("Message:", data);

    if (data.type === "request-client-list") {
      broadcastClients(); // Or just send to ws
      return;
    }

    if (data.target && clients[data.target]) {
      clients[data.target].send(JSON.stringify(data));
    }
  });

  ws.on("close", () => {
    console.log(`Client disconnected: ${ws.id}`);
    delete clients[ws.id];
    broadcastClients();
  });
});

function broadcastClients() {
  const list = Object.keys(clients).map(Number);

  const message = JSON.stringify({
    type: "client-list",
    clients: list,
  });

  for (let id in clients) {
    clients[id].send(message);
  }

  console.log("Broadcasted client list:", list);
}
