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

function appendObjectToFile(filename, newObject) {
  fs.readFile(filename, 'utf8', (err, fileData) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, create a new one with the object
        const data = JSON.stringify([newObject], null, 2);
        fs.writeFile(filename, data, (err) => {
          if (err) {
            console.error('Error creating and writing file:', err);
          } else {
            console.log('New JSON file created with the object.');
          }
        });
      } else {
        console.error('Error reading file:', err);
      }
      return;
    }

    try {
      // Parse existing data and append new object
      const jsonData = JSON.parse(fileData);
      jsonData.push(newObject);
      const updatedData = JSON.stringify(jsonData, null, 2);

      fs.writeFile(filename, updatedData, (err) => {
        if (err) {
          console.error('Error appending object to file:', err);
        } else {
          console.log('Object appended successfully!');
        }
      });
    } catch (parseError) {
      console.error('Error parsing JSON data:', parseError);
    }
  });
}

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
    appendObjectToFile("data.json", {
      topic: topic,
      message: message.toString(),
      time: new Date(Date.now()),
    });
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

app.get('/data.json', (req, res) => {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Error reading data');
    } else {
      res.json(JSON.parse(data));
    }
  });
});



server.listen(3001, () => {
  console.log("HTTP server running on port 3001");
});
