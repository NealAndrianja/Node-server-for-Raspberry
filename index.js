const cors = require("cors");
const serverConfig = require("./config/server.config");
const { createSocketServer, socketHandler } = require("./controllers/socketController");
const { connectToBroker } = require("./controllers/mqttControllers");

const express = require("express");
const app = express();
const http = require("http");
// const fs = require("fs");
// let mqttClient;

app.use(cors(serverConfig.cors));

const server = http.createServer(app);

const io = createSocketServer(server, serverConfig)
socketHandler(io)

connectToBroker(io)

server.listen(serverConfig.port, () => {
  console.log(`HTTP server running on port ${serverConfig.port})}`);
});

