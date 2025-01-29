import { GetAllDensResponse } from '@/lib/den';
import { den } from '@prisma/client';
import axiosClient from './axios';

export async function fetchDens(derbyId: number | string): Promise<den[]> {
  const response = await axiosClient.get<GetAllDensResponse>(
    `/api/den?derby_id=${derbyId}`
  );
  return response.data.dens;
}
