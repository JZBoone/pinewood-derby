import { car, derby, heat } from '@prisma/client';
import { db } from './db';
import { getDerbyCars } from './car';
import { getDerbyHeats, makeHeats } from './heat';
import { averageTimeForCar } from '@/lib/heat';
import { carsWithTimes } from '@/lib/car';

export async function makeChampionships(derbyId: derby['id']) {
  // make this operation idempotent so that you can regenerate the championships
  await db.heat.deleteMany({
    where: { derby_id: derbyId, den_id: null },
  });

  const cars = await getDerbyCars(derbyId);
  const heats = await getDerbyHeats(derbyId);
  const denIds = Array.from(new Set(cars.map((car) => car.den_id)));
  const champions: car['id'][] = [];
  for (const denId of denIds) {
    const denCars = cars.filter((car) => car.den_id === denId);
    let bestAverageTime = Infinity;
    let denChampion: car['id'] | null = null;
    for (const denCar of denCars) {
      const averageTime = averageTimeForCar(denCar.id, heats);
      if (averageTime && averageTime < bestAverageTime) {
        bestAverageTime = averageTime;
        denChampion = denCar.id;
      }
    }
    if (denChampion) {
      champions.push(denChampion);
    }
  }
  if (!champions.length) {
    throw new Error('No champions found');
  }
  return makeHeats(
    cars.filter((car) => champions.includes(car.id)),
    derbyId,
    true // is championship
  );
}

function getHeatCars(heats: heat[]): car['id'][] {
  const carIds = new Set<car['id']>();
  for (const heat of heats) {
    if (heat.lane_1_car_id) {
      carIds.add(heat.lane_1_car_id);
    }
    if (heat.lane_2_car_id) {
      carIds.add(heat.lane_2_car_id);
    }
    if (heat.lane_3_car_id) {
      carIds.add(heat.lane_3_car_id);
    }
    if (heat.lane_4_car_id) {
      carIds.add(heat.lane_4_car_id);
    }
    if (heat.lane_5_car_id) {
      carIds.add(heat.lane_5_car_id);
    }
    if (heat.lane_6_car_id) {
      carIds.add(heat.lane_6_car_id);
    }
  }
  return Array.from(carIds);
}

export async function getChampionships(derbyId: derby['id']) {
  const heats = await db.heat.findMany({
    where: { derby_id: derbyId, den_id: null },
  });
  const heatCarIds = getHeatCars(heats);
  if (heatCarIds.length === 0) {
    throw new Error('No cars in heats');
  }
  const cars = await db.car.findMany({
    where: { id: { in: heatCarIds } },
  });
  return {
    heats,
    cars: carsWithTimes(cars, heats),
  };
}
