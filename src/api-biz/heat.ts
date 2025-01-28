import { car } from '@prisma/client';

export function groupCars(cars: car[]): car[][] {
  const numberOfGroups = Math.ceil(cars.length / 6);
  const groups: car[][] = [];
  for (let i = 0; i < numberOfGroups; i++) {
    groups.push([]);
  }
  let groupCursor = 0;
  for (const car of cars) {
    groups[groupCursor].push(car);
    groupCursor = (groupCursor + 1) % numberOfGroups;
  }
  return groups;
}
