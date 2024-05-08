const router = require("express").Router();
const { readFromDB } = require("../controllers/dataController");

router.get("/voltage/:start", async (req, res) => {

  let fluxQuery = `from(bucket: "smarthome")
|> range(start: ${req.params.start})
|> filter(fn: (r) => r["_measurement"] == "smart_socket")
|> filter(fn: (r) => r["_field"] == "home/esp32/voltage")
|> filter(fn: (r) => r["room"] == "living_room")`;

try {
  const data = await readFromDB(fluxQuery);
  res.status(200).json(data);
} catch (error) {
  res.status(500).send(error)
}
});

module.exports = router;
