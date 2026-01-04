// import { PrismaClient } from '@prisma/client';

// // preserve the same Prisma client instance during hot reloading in the development environment
// // this prevents multiple database connections from being established unnecessarily, potentially
// // exhausting the database connection pool
// const globalForPrisma = global as unknown as { db: PrismaClient };

// export const db =
//   globalForPrisma.db ||
//   new PrismaClient({
//     log: ['error'],
//   });

// if (process.env.NODE_ENV !== 'production') globalForPrisma.db = db;

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/prisma/client';

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});
export const db = new PrismaClient({ adapter });