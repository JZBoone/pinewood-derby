import { fetchCars } from '@/client-biz/car';
import { fetchChampionshipData } from '@/client-biz/championship';
import { fetchDens } from '@/client-biz/den';
import { fetchDerbyById } from '@/client-biz/derby';
import { fetchDerbyHeats } from '@/client-biz/heat';
import { carsWithTimes } from '@/lib/car';
import { heatHasTimes } from '@/lib/heat';

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
      const denHeats = heats.filter((heat) => heat.den_id === den.id);
      return {
        ...den,
        heatCount: denHeats.length,
        timedHeatCount: denHeats.filter(heatHasTimes).length,
        cars: carsWithTimes(
          cars.filter((car) => car.den_id === den.id),
          heats
        ),
      };
    }),
  };
}

export type DerbyData = Awaited<ReturnType<typeof fetchDerbyData>>;
