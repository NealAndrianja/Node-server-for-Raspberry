const { Server } = require("socket.io");
const mqttEventEmitter = require('../event/events');

const commands = [
  {
      name: "IO",
      command: "home/esp32/command"
  }
]

const createSocketServer = (httpServer, serverConfig) => {
  return new Server(httpServer, serverConfig);
};


const socketHandler = io => {  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    commands.forEach((topic) =>
      socket.on(topic.name, (data) => {
        console.log(data);
        mqttEventEmitter.emit("commande", topic.command, data.toString())
        // publishToTopic(topic.command, data.toString());
      })
    );

    mqttEventEmitter.on('message', (topic, message) => { 
        io.emit(topic, message); 
      });
  })};




module.exports = {
  createSocketServer,
  socketHandler,
};