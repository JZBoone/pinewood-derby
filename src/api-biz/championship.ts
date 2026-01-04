import { carsWithTimes } from '@/lib/car';
import { bestTimeForCar } from '@/lib/heat';
import { car, derby, heat } from '@generated/client';
import { getDerbyCars } from './car';
import { db } from './db';
import { getDerbyHeats, makeHeats } from './heat';

export async function makeChampionship(derbyId: derby['id']) {
  // make this operation idempotent so that you can regenerate the championship
  await db.heat.deleteMany({
    where: { derby_id: derbyId, den_id: null },
  });

  const cars = await getDerbyCars(derbyId);
  const heats = await getDerbyHeats(derbyId);
  const denIds = Array.from(new Set(cars.map((car) => car.den_id)));
  const champions: car['id'][] = [];
  for (const denId of denIds) {
    const denCars = cars.filter((car) => car.den_id === denId);
    let bestTime = Infinity;
    let denChampion: car['id'] | null = null;
    for (const denCar of denCars) {
      const carBestTime = bestTimeForCar(denCar.id, heats);
      if (carBestTime && carBestTime < bestTime) {
        bestTime = carBestTime;
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

export async function getChampionship(derbyId: derby['id']) {
  const [heats, dens] = await Promise.all([
    db.heat.findMany({
      where: { derby_id: derbyId, den_id: null },
      orderBy: { id: 'asc' },
    }),
    db.den.findMany({ where: { derby_id: derbyId } }),
  ]);
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
    dens,
  };
}
