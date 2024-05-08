const { InfluxDB, Point } = require("@influxdata/influxdb-client");
const dotenv = require("dotenv");

dotenv.config();

const token = process.env.INFLUXDB_TOKEN;
const url = "http://192.168.1.200:8086";

const client = new InfluxDB({ url, token });
let org = `Box Domotique`;
let bucket = `smarthome`;

let writeClient = client.getWriteApi(org, bucket, "ns");
let queryClient = client.getQueryApi(org);

const writeToDB = (topic, message) => {
  let point = new Point("smart_socket")
    .tag("room", "living_room")
    .floatField(topic, parseFloat(message));
  writeClient.writePoint(point);
  writeClient.flush();
};

const readFromDB = async (query) => {
  const result = [];
  for await (const { values, tableMeta } of queryClient.iterateRows(query)) {
    result.push(tableMeta.toObject(values));
  }
  return result;
};

module.exports = {
  writeToDB,
  readFromDB,
};
