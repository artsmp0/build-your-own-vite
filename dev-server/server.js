import http from "node:http";
import { readFile } from "node:fs/promises";

import express from "express";
import path from "node:path";
import chokidar from "chokidar";
import { WebSocket, WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const ws = new WebSocketServer({ server });

/** @type {WebSocket} */
let socket;

ws.on("connection", (_socket) => {
  console.log("Socket connected...");
  socket = _socket;
});

const watcher = chokidar.watch("src/*.js");
watcher.on("change", (file) => {
  const payload = JSON.stringify({
    type: "file:change",
    file: `/${file}`,
  });
  socket.send(payload);
});

// need middleware to inject hmr client code
/** @type {express.Handler} */
const hmrMiddleware = async (req, res, next) => {
  if (!req.url.endsWith(".js")) {
    return next();
  }

  const client = await readFile(path.join(process.cwd(), "client.js"), "utf-8");
  let content = await readFile(path.join(process.cwd(), req.url), "utf-8");
  content = `
  ${client}

  hmrClient(import.meta);

  ${content}
  `;

  res.type(".js");
  res.send(content);
};

app.use(hmrMiddleware);
app.use(express.static(process.cwd()));

server.listen(8080, () => console.log("Listening on http://localhost:8080"));
