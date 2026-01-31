import { nowIsoString } from '@/lib/util';
import { pick } from 'lodash';
import { DateTime } from 'luxon';
import { createCars, deleteCar } from './car';
import { DeserializedCsvRecord } from './csv';
import { db } from './db';

async function createDerby() {
  return db.derby.create({
    data: {
      time: DateTime.now().plus({ week: 1 }).toUTC().toISO(),
      created_at: nowIsoString(),
      location_name: 'Williams Elmentary',
    },
  });
}

async function setup() {
  const derby = await createDerby();
  const den1 = await db.den.create({ data: { derby_id: derby.id, name: '1' } });
  const den2 = await db.den.create({ data: { derby_id: derby.id, name: '2' } });
  const records: DeserializedCsvRecord[] = [
    {
      denNumber: +den1.name,
      carNumber: 101,
      carName: 'Speedster',
      owner: 'John Doe',
      superlative: 'Fastest',
    },
    {
      denNumber: +den2.name,
      carNumber: 102,
      carName: 'Lightning',
      owner: 'Jane Doe',
      superlative: 'Sleekest',
    },
  ];
  return { derby, den1, den2, records };
}

describe('createCars', () => {
  it('should create cars successfully', async () => {
    const { records, derby, den1, den2 } = await setup();
    const result = await createCars({ derbyId: derby.id, records });
    expect(
      result.cars.map((car) =>
        pick(car, ['den_id', 'number', 'name', 'owner', 'superlative'])
      )
    ).toEqual([
      {
        den_id: den1.id,
        number: 101,
        name: 'Speedster',
        owner: 'John Doe',
        superlative: 'Fastest',
      },
      {
        den_id: den2.id,
        number: 102,
        name: 'Lightning',
        owner: 'Jane Doe',
        superlative: 'Sleekest',
      },
    ]);
  });

  it('should throw an error if a car references a non-existent den', async () => {
    const derby = await createDerby();
    const records: DeserializedCsvRecord[] = [
      {
        denNumber: 999,
        carNumber: 102,
        carName: 'Lightning',
        owner: 'Jane Doe',
        superlative: 'Sleekest',
      },
    ];

    await expect(createCars({ derbyId: derby.id, records })).rejects.toThrow(
      'One or more cars references a den that does not exist'
    );
  });
});

describe('deleteCar', () => {
  it('should delete a car and associated heats successfully', async () => {
    const { derby } = await setup();
    const den = await db.den.create({
      data: { derby_id: derby.id, name: '3' },
    });
    const car = await db.car.create({
      data: {
        den_id: den.id,
        number: 103,
        name: 'The Annihilator',
        owner: 'Dr. Doom',
      },
    });

    const heat = await db.heat.create({
      data: {
        derby_id: derby.id,
        lane_1_car_id: car.id,
        created_at: new Date(),
      },
    });

    await deleteCar(car.id);

    const deletedCar = await db.car.findUnique({ where: { id: car.id } });
    expect(deletedCar).toBeNull();

    const deletedHeat = await db.heat.findUnique({ where: { id: heat.id } });
    expect(deletedHeat).toBeNull();
  });
});
