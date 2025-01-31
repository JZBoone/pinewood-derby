import { ChampionshipsData } from '@/lib/championships';
import axiosClient from './axios';

export async function fetchChampionshipsData(
  derbyId: number | string
): Promise<ChampionshipsData> {
  const response = await axiosClient.get<ChampionshipsData>(
    `/api/derby/championships?derby_id=${derbyId}`
  );
  return response.data;
}
