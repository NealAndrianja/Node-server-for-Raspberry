const router = require("express").Router();
const dotenv = require("dotenv");

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY;
const location = "Antananarivo";

router.get("/", async (req, res) => {
  const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&aqi=no`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).send("Error fetching weather data.");
  }
});

module.exports = router;
