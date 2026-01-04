import { car, heat } from '@generated/client';
import { bestTimeForCar } from './heat';

export type GetCarsResponse = {
  cars: car[];
};

export type CarWithBestTime = car & {
  best_time?: number | null;
  scale_mph?: string | null;
};

export function scaleMph(milliseconds: number): string {
  // I reverse engineered the math from a screenshot of the 2024 spreadsheet
  const mph = 596576.4 / milliseconds;
  return `${mph.toFixed(0)} mph`;
}

export function carsWithTimes(cars: car[], heats: heat[]): CarWithBestTime[] {
  return cars
    .map((car) => {
      const bestTime = bestTimeForCar(car.id, heats);
      return {
        ...car,
        best_time: bestTime,
        scale_mph: bestTime ? scaleMph(bestTime) : null,
      };
    })
    .sort((a, b) => {
      if (a.best_time === null) return 1;
      if (b.best_time === null) return -1;
      return a.best_time - b.best_time;
    });
}
