import { ReadlineParser } from '@serialport/parser-readline';
import axios from 'axios';
import { createInterface } from 'readline';
import { SerialPort } from 'serialport';

const DERBY_ID = 1;
const API_URL = 'http://localhost:3000/api/heat';
const SERIAL_PORT_PATH = 'COM4'; 
const BAUD_RATE = 9600;

console.log(`Attempting to connect to ${SERIAL_PORT_PATH}...`);

const port = new SerialPort({
  path: SERIAL_PORT_PATH,
  baudRate: BAUD_RATE,
  autoOpen: false, // We will open it manually to handle errors better
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// 1. SETUP KEYBOARD INPUT (This replaces the Arduino Serial Monitor)
const keyboardInput = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Forward whatever you type to the Arduino
keyboardInput.on('line', (input) => {
  port.write(input + '\n', (err) => {
    if (err) return console.error('Error writing to port:', err.message);
  });
});

// 2. OPEN THE CONNECTION
port.open((err) => {
  if (err) {
    console.error(`\n❌ FAILED to open ${SERIAL_PORT_PATH}.`);
    console.error(`   Reason: ${err.message}`);
    console.error(`   HINT: Is the Arduino IDE Serial Monitor still open? Close it!\n`);
    process.exit(1);
  }
  console.log(`✅ Connected to ${SERIAL_PORT_PATH}`);
  console.log(`   You can now type commands like 'race' or 'test' below.\n`);
});

// 3. LISTEN FOR DATA FROM ARDUINO
parser.on('data', async (line) => {
  const cleanLine = line.trim();
  
  // Print Arduino output to console so you can see what's happening
  console.log(`[Arduino]: ${cleanLine}`);

  // Detect the "Race Finished" marker
  if (cleanLine.startsWith('### [')) {
    console.log('\n🏁 Race finished. Processing results...');
    
    try {
      // Extract JSON part: "### [1000, 0, ...]" -> "[1000, 0, ...]"
      const timesJson = cleanLine.substring(cleanLine.indexOf('['));
      const parsedTimes = JSON.parse(timesJson);

      if (Array.isArray(parsedTimes) && parsedTimes.length === 6) {
        
        const payload = {
          derby_id: DERBY_ID,
          times: parsedTimes,
        };
        try {
          await axios.post(API_URL, payload);
          console.log('🚀 API Update Successful!\n');
        } catch (e) {
          console.error(e);
        }
        
      } else {
        console.error('⚠️ Parsed data is invalid:', parsedTimes);
      }
    } catch (error) {
       console.error('❌ Error processing results:', error.message);
    }
  }
});

// Handle disconnections (e.g., if you unplug the USB)
port.on('close', () => {
  console.log('\n🔌 Port closed. Exiting...');
  process.exit(0);
});