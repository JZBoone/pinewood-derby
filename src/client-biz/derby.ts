import { GetDerbiesResponse, GetDerbyByIdResponse } from '@/lib/derby';
import { derby } from '@generated/client';
import axiosClient from './axios';
import { buildAuthHeaders } from './auth-headers';

export async function fetchDerbies(): Promise<derby[]> {
  const response = await axiosClient.get<GetDerbiesResponse>('/api/derby');
  return response.data.derbies;
}

export async function fetchDerbyById(
  id: number | string
): Promise<derby | null> {
  const response = await axiosClient.get<GetDerbyByIdResponse>(
    `/api/derby/${id}`
  );
  return response.data.derby;
}

export async function createDerby(
  params: {
    time: string;
    location_name: string;
  },
  token: string
): Promise<derby> {
  const response = await axiosClient.post<derby>('/api/derby', params, {
    headers: {
      ...buildAuthHeaders(token),
    },
  });
  return response.data;
}

export async function uploadDerbyCsv(
  derbyId: number,
  csvText: string,
  token: string
): Promise<unknown> {
  const response = await fetch(`/api/derby/csv?derby_id=${derbyId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/csv',
      ...buildAuthHeaders(token),
    },
    body: csvText,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload?.error || `Failed to upload CSV (HTTP ${response.status})`;
    throw new Error(message);
  }

  return response.json();
}
