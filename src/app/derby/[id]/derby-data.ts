import { fetchCars } from '@/client-biz/car';
import { fetchChampionshipData } from '@/client-biz/championship';
import { fetchDens } from '@/client-biz/den';
import { fetchDerbyById } from '@/client-biz/derby';
import { fetchDerbyHeats } from '@/client-biz/heat';
import { carsWithTimes } from '@/lib/car';

export async function fetchDerbyData(derbyId: string | number) {
  const [{ derby, featured_art }, dens, cars, heats] = await Promise.all([
    fetchDerbyById(derbyId),
    fetchDens(derbyId),
    fetchCars(derbyId),
    fetchDerbyHeats(derbyId),
  ]);
  if (!derby) {
    throw new Error('Derby not found');
  }
  const championshipCreated = heats.some((heat) => heat.den_id === null);
  const championship = championshipCreated
    ? await fetchChampionshipData(derbyId)
    : null;
  return {
    championshipCreated,
    championship,
    derby,
    featuredArt: featured_art,
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
