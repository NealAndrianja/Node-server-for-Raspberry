const fs = require('fs/promises');
const path = require('path');

const filePath = path.join(__dirname, '..', 'files', 'devices.json');

const validateDeviceData = (data) => {
  if (!data.name || !data.type || !data.model || !data.serialNumber) {
    throw new Error('Invalid device data structure');
  }
};

const getDevices = async () => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    return [];
  }
};

const writeDeviceData = async (data) => {
  validateDeviceData(data);

  try {
    const devices = await getDevices();
    devices.push(data);

    await fs.writeFile(filePath, JSON.stringify(devices, null, 2), 'utf-8');
    console.log(`Device data written to ${filePath} successfully.`);
  } catch (error) {
    console.error('Error writing device data:', error);
    throw error;
  }
};

const updateDevice = async (deviceSerialNumber, updatedData) => {
  validateDeviceData(updatedData);

  try {
    const devices = await getDevices();
    const deviceIndex = devices.findIndex(device => device.serialNumber === deviceSerialNumber);

    if (deviceIndex === -1) {
      throw new Error(`Device with serial number ${deviceSerialNumber} not found.`);
    }

    devices[deviceIndex] = { ...devices[deviceIndex], ...updatedData };

    await fs.writeFile(filePath, JSON.stringify(devices, null, 2), 'utf-8');
    console.log(`Device with serial number ${deviceSerialNumber} updated successfully.`);
  } catch (error) {
    console.error('Error updating device:', error);
    throw error;
  }
};

const deleteDevice = async (deviceSerialNumber) => {
  try {
    const devices = await getDevices();
    const deviceIndex = devices.findIndex(device => device.serialNumber === deviceSerialNumber);

    if (deviceIndex === -1) {
      throw new Error(`Device with serial number ${deviceSerialNumber} not found.`);
    }

    devices.splice(deviceIndex, 1);

    await fs.writeFile(filePath, JSON.stringify(devices, null, 2), 'utf-8');
    console.log(`Device with serial number ${deviceSerialNumber} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting device:', error);
    throw error;
  }
};

module.exports = {
  getDevices,
  writeDeviceData,
  updateDevice,
  deleteDevice,
};
