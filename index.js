const cors = require("cors");
const serverConfig = require("./config/server.config");
const {
  createSocketServer,
  socketHandler,
} = require("./controllers/socketController");
const { connectToBroker } = require("./controllers/mqttControllers");

const socketDataRoute = require("./routes/socketData");
const deviceDataRoute = require("./routes/devicesRoute");
const weatherDataRoute = require("./routes/weatherRoute");

const express = require("express");
const app = express();
const http = require("http");

const dotenv = require("dotenv");

dotenv.config();

app.use(cors(serverConfig.cors));
app.use(express.json())

const server = http.createServer(app);

const io = createSocketServer(server, serverConfig);
socketHandler(io);

connectToBroker(io);

app.use("/data/socket", socketDataRoute);
app.use("/data", deviceDataRoute);
app.use("/weather", weatherDataRoute);

server.listen(serverConfig.port, () => {
  console.log(`HTTP server running on port ${serverConfig.port})}`);
});
