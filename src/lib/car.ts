import { car } from '@prisma/client';

export type GetAllCarsResponse = {
  cars: car[];
};
