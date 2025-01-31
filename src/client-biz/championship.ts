import { ChampionshipData, MakeChampionShipBody } from '@/lib/championship';
import axiosClient from './axios';

export async function makeChampionship(
  derbyId: number | string
): Promise<ChampionshipData> {
  const body: MakeChampionShipBody = { derby_id: Number(derbyId) };
  const response = await axiosClient.post<ChampionshipData>(
    `/api/derby/championship`,
    body
  );
  return response.data;
}

export async function fetchChampionshipData(
  derbyId: number | string
): Promise<ChampionshipData> {
  const response = await axiosClient.get<ChampionshipData>(
    `/api/derby/championship?derby_id=${derbyId}`
  );
  return response.data;
}
