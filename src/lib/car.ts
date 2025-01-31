import { car, heat } from '@prisma/client';
import { averageTimeForCar } from './heat';

export type GetCarsResponse = {
  cars: car[];
};

export type CarWithAverageTime = car & { average_time?: number | null };

export function carsWithTimes(
  cars: car[],
  heats: heat[]
): CarWithAverageTime[] {
  return cars
    .map((car) => ({
      ...car,
      average_time: averageTimeForCar(car.id, heats),
    }))
    .sort((a, b) => {
      if (a.average_time === null) return 1;
      if (b.average_time === null) return -1;
      return a.average_time - b.average_time;
    });
}
