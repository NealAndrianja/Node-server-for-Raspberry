const mqtt = require('mqtt');
const config = require('../config/mqtt.config');
const {socketEmitter} = require('./socketController')
const mqttEventEmitter = require('../event/events');
const {writeToDB} = require('./dataController')

let mqttClient;

const topics = [
    "home/esp32/voltage",
    "home/esp32/current",
    "home/esp32/power",
    "home/esp32/energy",
    "home/esp32/frequency",
    "home/esp32/pf"
]


function connectToBroker(io) {
  const clientId = `client-${Math.random().toString(36).substring(7)}`;
  const hostURL = `${config.protocol}://${config.host}:${config.port}`;

  const options = {
    keepalive: 60,
    clientId: clientId,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    username: config.username,
    password: config.password
  };

  mqttClient = mqtt.connect(hostURL, options);

  mqttClient.on('error', (err) => {
    console.error('MQTT Error:', err);
    mqttClient.end();
  });

  mqttClient.on('connect', () => {
    console.log(`MQTT Client connected: ${clientId}`);
    topics.forEach(topic => subscribeToTopic(mqttClient, topic));
  });

  mqttClient.on('message', (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);
    //write to influxDB
    writeToDB(topic, message.toString());

    //emit to socket
    mqttEventEmitter.emit('message', topic, message.toString()) 
  });

  mqttEventEmitter.on("command", (topic, data) => {
    publishToTopic(topic, data);
  })

}

function subscribeToTopic(client, topic) {
  console.log(`Subscribing to Topic: ${topic}`);
  client.subscribe(topic, { qos: 0 });
}

function publishToTopic(topic, message) {
  console.log(`Sending Topic: ${topic}, Message: ${message}`);
  mqttClient.publish(topic, message, {
    qos: 0,
    retain: false
  });
}

module.exports = {
  connectToBroker,
  publishToTopic
};
