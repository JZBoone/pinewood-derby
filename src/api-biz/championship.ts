import { car, derby } from '@prisma/client';
import { db } from './db';
import { getDerbyCars } from './car';
import { getDerbyHeats, makeHeats } from './heat';
import { averageTimeForCar } from '@/lib/heat';

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
