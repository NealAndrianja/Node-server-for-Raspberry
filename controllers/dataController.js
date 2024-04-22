const fs = require('fs/promises'); // Use promises for cleaner async/await syntax

const appendObjectToFile = async (filename, newObject) => {
  try {
    const data = await fs.readFile(filename, 'utf8');
    let jsonData;
    if (data) {
      jsonData = JSON.parse(data);
    } else {
      jsonData = []; // Initialize with empty array if file is empty
    }
    jsonData.push(newObject);
    const updatedData = JSON.stringify(jsonData, null, 2);
    await fs.writeFile(filename, updatedData);
    console.log('Object appended successfully!');
  } catch (err) {
    console.error('Error appending object to file:', err);
  }
};

const getData = async () => {
  try {
    const data = await fs.readFile('data.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // Handle error gracefully (e.g., log error, return empty array)
    return [];
  }
};

module.exports = {
  appendObjectToFile,
  getData
};

