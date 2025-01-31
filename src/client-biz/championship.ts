import { ChampionshipData } from '@/lib/championship';
import axiosClient from './axios';

export async function fetchChampionshipData(
  derbyId: number | string
): Promise<ChampionshipData> {
  const response = await axiosClient.get<ChampionshipData>(
    `/api/derby/championship?derby_id=${derbyId}`
  );
  return response.data;
}
