import { den, derby, heat } from '@prisma/client';
import { CarWithAverageTime } from './car';

export type ChampionshipData = {
  heats: heat[];
  cars: CarWithAverageTime[];
  derby: derby;
  dens: den[];
};
