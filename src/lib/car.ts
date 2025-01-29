import { car } from '@prisma/client';

export type GetCarsResponse = {
  cars: car[];
};
