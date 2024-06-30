const mqtt = require("mqtt");
const config = require("../config/mqtt.config");
const { socketEmitter } = require("./socketController");
const mqttEventEmitter = require("../event/events");
const { writeToDB } = require("./dataController");

let mqttClient;

const topics = [
  "home/esp32/voltage",
  "home/esp32/current",
  "home/esp32/power",
  "home/esp32/energy",
  "home/esp32/frequency",
  "home/esp32/pf",
  "home/esp32/temperature",
  "home/esp32/humidite",
  "home/interrupteur/state",
  "home/prise/state",
];

function connectToBroker(io) {
  const clientId = `client-${Math.random().toString(36).substring(7)}`;
  const hostURL = `${config.protocol}://${config.host}:${config.port}`;

  const options = {
    keepalive: 60,
    clientId: clientId,
    protocolId: "MQTT",
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    username: config.username,
    password: config.password,
  };

  mqttClient = mqtt.connect(hostURL, options);

  mqttClient.on("error", (err) => {
    console.error("MQTT Error:", err);
    mqttClient.end();
  });

  mqttClient.on("connect", () => {
    console.log(`MQTT Client connected: ${clientId}`);
    topics.forEach((topic) => subscribeToTopic(mqttClient, topic));
  });

  mqttClient.on("message", (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);

    if (topic !== "home/interrupteur/state" && topic !== "home/prise/state") {
      //write to influxDB
      writeToDB(topic, message.toString());
      //emit to socket
      mqttEventEmitter.emit("message", topic, message.toString());
    }
    // Handle LWT message
    handleSensorStatus(topic, message.toString());
  });

  mqttEventEmitter.on("command", (topic, data) => {
    publishToTopic(topic, data);
  });
}

function subscribeToTopic(client, topic) {
  console.log(`Subscribing to Topic: ${topic}`);
  client.subscribe(topic, { qos: 0 });
}

function publishToTopic(topic, message) {
  console.log(`Sending Topic: ${topic}, Message: ${message}`);
  mqttClient.publish(topic, message, {
    qos: 0,
    retain: false,
  });
}

function handleSensorStatus(topic, status) {
  const regex = /\/(.*?)\//; 
  const match = regex.exec(topic);
  const device = match[1];
  if (status === "offline") {
    console.log(`${device} is offline`);
    // Handle sensor offline status, e.g., notify via socket or log the event
    mqttEventEmitter.emit("sensor-status", "offline");
  } else if (status === "online") {
    console.log(`${device} is online`)
    // Handle sensor online status, e.g., notify via socket or log the event
    mqttEventEmitter.emit("sensor-status", "online");
  }
}

module.exports = {
  connectToBroker,
  publishToTopic,
};
