const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mqtt = require("mqtt");
const fs = require("fs");
let mqttClient;

// app.use(cors());
app.use(cors({ origin: "http://localhost:3000" }));


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("IO", data => {
    console.log(data);
    publishToTopic('home/esp32/command', data.isEnabled.toString());
  })
});

const mqttHost = "192.168.1.25";
const protocol = "mqtt";
const port = "1883";

function connectToBroker() {
  const clientId = "client" + Math.random().toString(36).substring(7);

  const hostURL = `${protocol}://${mqttHost}:${port}`;

  const options = {
    keepalive: 60,
    clientId: clientId,
    protocolId: "MQTT",
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    username: "neal",
    password: "1234",
  };

  mqttClient = mqtt.connect(hostURL, options);

  mqttClient.on("error", (err) => {
    console.log("Error: ", err);
    mqttClient.end();
  });

  mqttClient.on("connect", () => {
    console.log("Client connected:" + clientId);
  });

  // Received Message
  mqttClient.on("message", (topic, message, packet) => {
    console.log(
      "Received Message: " + message.toString() + "\nOn topic: " + topic
    );
    let mqttMessage = message.toString()
    io.emit("mqtt", mqttMessage)
  });
}

function subscribeToTopic(topic) {
  console.log(`Subscribing to Topic: ${topic}`);

  mqttClient.subscribe(topic, { qos: 0 });
}

function publishToTopic(topic, message) {
  console.log(`Sending Topic: ${topic}, Message: ${message}`);
  mqttClient.publish(topic, message, {
    qos: 0,
    retain: false,
  });
}

connectToBroker();
subscribeToTopic("home/esp32/voltage");



server.listen(3001, () => {
  console.log("HTTP server running on port 3001");
});
