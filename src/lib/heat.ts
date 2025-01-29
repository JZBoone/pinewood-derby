import { car, den, heat } from '@prisma/client';

export type GetHeatsResponse = {
  heats: heat[];
  den: den;
  cars: car[];
};
