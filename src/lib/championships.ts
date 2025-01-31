import { derby, heat } from '@prisma/client';
import { CarWithAverageTime } from './car';

export type ChampionshipsData = {
  heats: heat[];
  cars: CarWithAverageTime[];
  derby: derby;
};
