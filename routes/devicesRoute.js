const express = require('express');
const {
  getDevices,
  writeDeviceData,
  updateDevice,
  deleteDevice,
} = require('../controllers/devicesController');

const router = express.Router();

router.get('/devices', async (req, res) => {
  try {
    const devices = await getDevices();
    res.json(devices);
  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).json({ message: 'Error fetching devices' });
  }
});

router.post('/devices', async (req, res) => {
  const deviceData = req.body;
  try {
    await writeDeviceData(deviceData);
    res.json({ message: 'Device created successfully.' });
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/devices/:serialNumber', async (req, res) => {
  const serialNumber = req.params.serialNumber;
  const updatedData = req.body;
  try {
    await updateDevice(serialNumber, updatedData);
    res.json({ message: 'Device updated successfully.' });
  } catch (error) {
    console.error('Error updating device:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({ message: 'Device not found' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

router.delete('/devices/:serialNumber', async (req, res) => {
  const serialNumber = req.params.serialNumber;
  try {
    await deleteDevice(serialNumber);
    res.json({ message: 'Device deleted successfully.' });
  } catch (error) {
    console.error('Error deleting device:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({ message: 'Device not found' });
    } else {
      res.status(500).json({ message: 'Error deleting device' });
    }
  }
});

module.exports = router;
