const fs = require('fs/promises');
const path = require('path');

const filePath = path.join(__dirname, '..', 'files', 'devices.json');

const validateDeviceData = (data) => {
  // Validate data structure (replace with your actual expected structure)
  if (!data.name || !data.brand || !data.model || !data.serialNumber) {
    throw new Error('Invalid device data structure');
  }
};

const getDevices = async () => {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return data ? JSON.parse(data) : []; // Return empty array if data is empty or absent
    } catch (error) {
      if (error.code !== 'ENOENT') { // Ignore "file not found" error
        throw error;
      }
      return []; // Return empty array if file doesn't exist
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
    throw error; // Re-throw error for route handling
  }
};

const updateDevice = async (deviceId, updatedData) => {
  validateDeviceData(updatedData);

  try {
    const devices = await getDevices();
    const deviceIndex = devices.findIndex((device) => device.id === deviceId); // Find device by ID

    if (deviceIndex === -1) {
      throw new Error(`Device with ID ${deviceId} not found.`);
    }

    devices[deviceIndex] = { ...devices[deviceIndex], ...updatedData }; // Update device data

    await fs.writeFile(filePath, JSON.stringify(devices, null, 2), 'utf-8');
    console.log(`Device with ID ${deviceId} updated successfully.`);
  } catch (error) {
    console.error('Error updating device:', error);
    throw error; // Re-throw error for route handling
  }
};

const deleteDevice = async (deviceId) => {
  try {
    const devices = await getDevices();
    const deviceIndex = devices.findIndex((device) => device.id === deviceId); // Find device by ID

    if (deviceIndex === -1) {
      throw new Error(`Device with ID ${deviceId} not found.`);
    }

    devices.splice(deviceIndex, 1); // Remove device from array

    await fs.writeFile(filePath, JSON.stringify(devices, null, 2), 'utf-8');
    console.log(`Device with ID ${deviceId} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting device:', error);
    throw error; // Re-throw error for route handling
  }
};

module.exports = {
  getDevices,
  writeDeviceData,
  updateDevice,
  deleteDevice,
};
