import { GetAllDerbyResponse, GetDerbyByIdResponse } from '@/lib/derby';
import axiosClient from './axios';
import { derby } from '@prisma/client';

export async function fetchDerbies(): Promise<derby[]> {
  const response = await axiosClient.get<GetAllDerbyResponse>('/api/derby');
  return response.data.derbies;
}

export async function fetchDerbyById(id: number): Promise<derby | null> {
  const response = await axiosClient.get<GetDerbyByIdResponse>(
    `/api/derby/${id}`
  );
  return response.data.derby;
}
