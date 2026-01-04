import { GetCarsResponse } from '@/lib/car';
import { car } from '@generated/client';
import axiosClient from './axios';

export async function fetchCars(derbyId: number | string): Promise<car[]> {
  const response = await axiosClient.get<GetCarsResponse>(
    `/api/car?derby_id=${derbyId}`
  );
  return response.data.cars;
}
