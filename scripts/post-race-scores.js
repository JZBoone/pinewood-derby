import { ReadlineParser } from '@serialport/parser-readline';
import axios from 'axios';
import { SerialPort } from 'serialport';

// --- Configuration ---
const DERBY_ID = 1; // Hardcoded Derby ID
const API_URL = 'http://localhost:3000/api/heat';
const SERIAL_PORT_PATH = '/dev/ttyACM0'; // Adjust if your Arduino is on a different port
// ---------------------

const port = new SerialPort({
  path: SERIAL_PORT_PATH,
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => {
  console.log(`Serial port ${SERIAL_PORT_PATH} opened.`);
  console.log('Sending "race" command to start the race.');
  port.write('race\n', (err) => {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('Race command sent.');
  });
});

parser.on('data', async (line) => {
  console.log(`> ${line}`);

  if (line.startsWith('### [')) {
    console.log('Race times detected. Parsing and posting to API.');
    try {
      const timesJson = line.substring(line.indexOf('[')).replace(/\s/g, '');
      const times = JSON.parse(timesJson);

      if (Array.isArray(times) && times.length === 6) {
        console.log('Parsed times:', times);
        const payload = {
          derby_id: DERBY_ID,
          times: times,
        };

        await axios.post(API_URL, payload);
        console.log('Successfully posted scores to the API.');
      } else {
        console.error('Parsed data is not a valid times array:', times);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Error posting scores to API:',
          error.response?.data || error.message
        );
      } else {
        console.error('Error parsing line or posting scores:', error);
      }
    }
  }
});

port.on('error', (err) => {
  console.error('Serial Port Error: ', err.message);
});
