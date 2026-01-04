import { den, derby, heat } from '@generated/client';
import { CarWithBestTime } from './car';

export type ChampionshipData = {
  heats: heat[];
  cars: CarWithBestTime[];
  derby: derby;
  dens: den[];
};

export type MakeChampionShipBody = {
  derby_id: derby['id'];
};
