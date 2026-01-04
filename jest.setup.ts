import { db } from '@/api-biz/db';

beforeEach(async () => {
  await db.$executeRaw`TRUNCATE TABLE "heat" RESTART IDENTITY CASCADE`;
  await db.$executeRaw`TRUNCATE TABLE "car" RESTART IDENTITY CASCADE`;
  await db.$executeRaw`TRUNCATE TABLE "den" RESTART IDENTITY CASCADE`;
  await db.$executeRaw`TRUNCATE TABLE "derby" RESTART IDENTITY CASCADE`;
});

// to close the connection after every test suite
afterAll(async () => {
  await db.$disconnect();
});
