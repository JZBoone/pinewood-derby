import { fetchCars } from '@/client-biz/car';
import { fetchDens } from '@/client-biz/den';
import { fetchDerbyById } from '@/client-biz/derby';

export async function fetchDerbyData(derbyId: string | number) {
  const [derby, dens, cars] = await Promise.all([
    fetchDerbyById(derbyId),
    fetchDens(derbyId),
    fetchCars(derbyId),
  ]);
  if (!derby) {
    throw new Error('Derby not found');
  }
  return {
    derby,
    dens: dens.map((den) => {
      return {
        ...den,
        cars: cars.filter((car) => car.den_id === den.id),
      };
    }),
  };
}

export type DerbyData = Awaited<ReturnType<typeof fetchDerbyData>>;
