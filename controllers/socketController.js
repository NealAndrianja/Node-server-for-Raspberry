const { Server } = require("socket.io");
const mqttEventEmitter = require("../event/events");
const { getDevices } = require("./devicesController");

// const commands = [
//   {
//     name: "IO",
//     command: "home/esp32/command",
//   },
//   {
//     name: "brightness",
//     command: "home/esp32/gradateur",
//   },
// ];

const createSocketServer = (httpServer, serverConfig) => {
  return new Server(httpServer, serverConfig);
};

const socketHandler = (io) => {
  io.on("connection", async (socket) => {
    console.log(`User connected: ${socket.id}`);
    const devices = await getDevices()
    devices.forEach(device => {
      if(device.topics && device.topics.command){
        device.topics.command.forEach(command => {
          socket.on(command, data => {
            console.log(data)
            mqttEventEmitter.emit("command", command, data.toString())
            io.emit(`${command} broadcast`, data)// Broadcast to all clients
          })
        })
      }
    })

    // commands.forEach((topic) =>
    //   socket.on(topic.name, (data) => {
    //     console.log(data);
    //     mqttEventEmitter.emit("command", topic.command, data.toString());
    //     io.emit(`${topic.name} broadcast`, data); // Broadcast to all clients
    //   })
    // );

    mqttEventEmitter.on("message", (topic, message) => {
      io.emit(topic, message);
    });
  });
};

module.exports = {
  createSocketServer,
  socketHandler,
};
