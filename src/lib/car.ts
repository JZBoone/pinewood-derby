import { car, heat } from '@prisma/client';
import { bestTimeForCar as bestTimeForCar } from './heat';

export type GetCarsResponse = {
  cars: car[];
};

export type CarWithAverageTime = car & { best_time?: number | null };

export function carsWithTimes(
  cars: car[],
  heats: heat[]
): CarWithAverageTime[] {
  return cars
    .map((car) => ({
      ...car,
      best_time: bestTimeForCar(car.id, heats),
    }))
    .sort((a, b) => {
      if (a.best_time === null) return 1;
      if (b.best_time === null) return -1;
      return a.best_time - b.best_time;
    });
}
