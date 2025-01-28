import { car } from '@prisma/client';
import { groupCars } from './heat';

function makeCars(count: number): car[] {
  const cars: car[] = [];
  for (let i = 0; i < count; i++) {
    cars.push({
      id: i,
      den_id: 0,
      number: i,
      name: '',
      owner: '',
      superlative: '',
      created_at: new Date(),
    });
  }
  return cars;
}

const testCases: { cars: number; expectedGroups: number[] }[] = [
  { cars: 1, expectedGroups: [1] },
  { cars: 2, expectedGroups: [2] },
  { cars: 3, expectedGroups: [3] },
  { cars: 4, expectedGroups: [4] },
  { cars: 5, expectedGroups: [5] },
  { cars: 6, expectedGroups: [6] },
  { cars: 7, expectedGroups: [4, 3] },
  { cars: 8, expectedGroups: [4, 4] },
  { cars: 9, expectedGroups: [5, 4] },
  { cars: 10, expectedGroups: [5, 5] },
  { cars: 11, expectedGroups: [6, 5] },
  { cars: 12, expectedGroups: [6, 6] },
  { cars: 13, expectedGroups: [5, 4, 4] },
  { cars: 14, expectedGroups: [5, 5, 4] },
  { cars: 15, expectedGroups: [5, 5, 5] },
  { cars: 16, expectedGroups: [6, 5, 5] },
  { cars: 17, expectedGroups: [6, 6, 5] },
  { cars: 18, expectedGroups: [6, 6, 6] },
  { cars: 19, expectedGroups: [5, 5, 5, 4] },
  { cars: 20, expectedGroups: [5, 5, 5, 5] },
  { cars: 21, expectedGroups: [6, 5, 5, 5] },
  { cars: 22, expectedGroups: [6, 6, 5, 5] },
  { cars: 23, expectedGroups: [6, 6, 6, 5] },
  { cars: 24, expectedGroups: [6, 6, 6, 6] },
];

test.each(testCases)('groupCars', ({ cars, expectedGroups }) => {
  const result = groupCars(makeCars(cars));
  expect(result.map((g) => g.length)).toEqual(expectedGroups);
  const ids = new Set<number>();
  for (const group of result) {
    for (const car of group) {
      expect(ids.has(car.id)).toBe(false);
      ids.add(car.id);
    }
  }
});
