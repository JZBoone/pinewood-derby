import { car } from '@prisma/client';
import { groupCars, makeHeatsForGroup } from './heat';
import { db } from './db';
import { DateTime } from 'luxon';

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

describe('makeHeatsForGroup', () => {
  async function makeCars(denId: number, cars: number): Promise<car[]> {
    return await Promise.all(
      Array.from({ length: cars }).map((_, i) =>
        db.car.create({
          data: {
            den_id: denId,
            number: i,
            owner: 'owner ' + i,
          },
        })
      )
    );
  }
  async function setup() {
    const derby = await db.derby.create({
      data: {
        time: DateTime.now().plus({ week: 1 }).toUTC().toISO(),
        created_at: DateTime.now().toUTC().toISO(),
        location_name: 'Williams Elmentary',
      },
    });
    const den = await db.den.create({
      data: { derby_id: derby.id, name: '1' },
    });
    const cars = await makeCars(den.id, 6);
    return { derby, den, cars };
  }
  it('should create heats for each group', async () => {
    const { cars } = await setup();
    const heats = await makeHeatsForGroup(cars);
    expect(heats.length).toBe(6);
  });
});
