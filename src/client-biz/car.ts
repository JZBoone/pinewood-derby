import axiosClient from './axios';
import { car } from '@prisma/client';
import { GetAllCarsResponse } from '@/lib/car';

export async function fetchCars(derbyId: number | string): Promise<car[]> {
  const response = await axiosClient.get<GetAllCarsResponse>(
    `/api/car?derby_id=${derbyId}`
  );
  return response.data.cars;
}
