import { getAllDerbies } from '@/api-biz/derby';
import { GetDerbiesResponse } from '@/lib/derby';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const derbies = await getAllDerbies();
  const response: GetDerbiesResponse = { derbies: derbies };
  return NextResponse.json(response);
}
