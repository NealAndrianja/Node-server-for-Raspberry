const mqtt = require("mqtt");
const config = require("../config/mqtt.config");
const { socketEmitter } = require("./socketController");
const mqttEventEmitter = require("../event/events");
const { writeToDB } = require("./dataController");
const { getDevices } = require("./devicesController");

let mqttClient;

async function connectToBroker(io) {
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

  mqttClient.on("connect", async () => {
    console.log(`MQTT Client connected: ${clientId}`);
    const devices = await getDevices();
    devices.forEach((device) => {
      if (device.topics && device.topics.data) {
        subscribeToTopic(mqttClient, device.topics.lwt)
        device.topics.data.forEach((topic) => subscribeToTopic(mqttClient, topic));
      }
    });
  });

  mqttClient.on("message", (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);

    if (!topic.includes("/lwt")) {
      // Write to influxDB
      writeToDB(topic, message.toString());
      // Emit to socket
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
    mqttEventEmitter.emit("sensor-status", "offline");
  } else if (status === "online") {
    console.log(`${device} is online`);
    mqttEventEmitter.emit("sensor-status", "online");
  }
}

module.exports = {
  connectToBroker,
  publishToTopic,
};
