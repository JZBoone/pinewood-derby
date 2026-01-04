import { GetDensResponse } from '@/lib/den';
import { den } from '../../prisma/generated/prisma/client';
import axiosClient from './axios';

export async function fetchDens(derbyId: number | string): Promise<den[]> {
  const response = await axiosClient.get<GetDensResponse>(
    `/api/den?derby_id=${derbyId}`
  );
  return response.data.dens;
}
