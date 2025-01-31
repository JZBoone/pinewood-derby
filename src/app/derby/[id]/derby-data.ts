import { fetchCars } from '@/client-biz/car';
import { fetchDens } from '@/client-biz/den';
import { fetchDerbyById } from '@/client-biz/derby';
import { fetchDerbyHeats } from '@/client-biz/heat';
import { carsWithTimes } from '@/lib/car';

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
    championshipCreated: heats.some((heat) => heat.den_id === null),
    derby,
    dens: dens.map((den) => {
      return {
        ...den,
        cars: carsWithTimes(
          cars.filter((car) => car.den_id === den.id),
          heats
        ),
      };
    }),
  };
}

export type DerbyData = Awaited<ReturnType<typeof fetchDerbyData>>;
