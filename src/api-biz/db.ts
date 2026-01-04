// hot-reloading in development exhausts database connections if you instantiate new PrismaClient() in multiple files.
// The industry standard for Next.js + Prisma is to create one single file that instantiates the client and exports the instance.

import { PrismaClient } from '@generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db;
