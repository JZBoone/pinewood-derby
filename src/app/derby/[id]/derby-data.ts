import { fetchCars } from '@/client-biz/car';
import { fetchDens } from '@/client-biz/den';
import { fetchDerbyById } from '@/client-biz/derby';
import { fetchDerbyHeats } from '@/client-biz/heat';
import { averageTimeForCar } from '@/lib/heat';

export async function fetchDerbyData(derbyId: string | number) {
  const [derby, dens, cars, heats] = await Promise.all([
    fetchDerbyById(derbyId),
    fetchDens(derbyId),
    fetchCars(derbyId),
    fetchDerbyHeats(derbyId),
  ]);
  if (!derby) {
    throw new Error('Derby not found');
  }
  return {
    championshipsCreated: heats.some((heat) => heat.den_id === null),
    derby,
    dens: dens.map((den) => {
      return {
        ...den,
        cars: cars
          .filter((car) => car.den_id === den.id)
          .map((car) => ({
            ...car,
            average_time: averageTimeForCar(car.id, heats),
          }))
          .sort((a, b) => {
            if (a.average_time === null) return 1;
            if (b.average_time === null) return -1;
            return a.average_time - b.average_time;
          }),
      };
    }),
  };
}

export type DerbyData = Awaited<ReturnType<typeof fetchDerbyData>>;
