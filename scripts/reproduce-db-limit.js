// Run this with: npx tsx reproduce-db-limit.js
// Make sure your .env has the original Session Mode connection string (Port 5432)

import { PrismaPg } from '@prisma/adapter-pg';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// OPTION A: If you find an 'output' path in schema.prisma, point to that.
// Example: If output is "../generated/client", use that relative to this script.
const { PrismaClient } = require('../prisma/generated/prisma/client');

const clients = [];

async function exhaustConnections() {

  if (!process.env.DATABASE_URL) {
    throw new Error("❌ DATABASE_URL is missing from environment variables.");
  }
  console.log("🔥 Attempting to exhaust DB connections...");
  
  for (let i = 1; i <= 100; i++) {
    try {
      // 1. Create a NEW client instance (Simulating a new Vercel Cold Start)
      const adapter = new PrismaPg({
          connectionString: process.env.DATABASE_URL,
        });
      const client = new PrismaClient({ adapter });
      
      // 2. Force it to connect by running a simple query
      await client.$connect();
      await client.$queryRaw`SELECT 1`;
      
      clients.push(client); // Keep it open (don't disconnect)
      console.log(`Connection #${i} established.`);
    } catch (e) {
      console.error(`\n💥 CRASHED at Connection #${i}`);
      console.error("Error Code:", e.code); // Look for P1001 or max clients error
      console.error("Message:", e.message);
      break; 
    }
  }
  
  // Cleanup (optional, script will exit anyway)
  console.log("\nCleaning up...");
  await Promise.all(clients.map(c => c.$disconnect()));
}

exhaustConnections();