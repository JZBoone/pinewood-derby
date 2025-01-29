import { NextResponse } from 'next/server';
import { getAllDerbies } from '@/api-biz/derby';
import { GetDerbiesResponse } from '@/lib/derby';

export async function GET() {
  const derbies = await getAllDerbies();
  const response: GetDerbiesResponse = { derbies: derbies };
  return NextResponse.json(response);
}
