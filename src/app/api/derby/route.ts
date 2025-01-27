import { NextResponse } from 'next/server';
import { getAllDerbies } from '@/api-biz/derby';
import { GetAllDerbyResponse } from '@/lib/derby';

export async function GET() {
  const derbies = await getAllDerbies();
  const response: GetAllDerbyResponse = { derbies: derbies };
  return NextResponse.json(response);
}
