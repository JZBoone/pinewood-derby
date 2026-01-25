import { createDerby, getAllDerbies } from '@/api-biz/derby';
import { GetDerbiesResponse } from '@/lib/derby';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const derbies = await getAllDerbies();
  const response: GetDerbiesResponse = { derbies: derbies };
  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { time, location_name } = body;

  if (!time || !location_name) {
    return new Response('Invalid payload', { status: 400 });
  }

  const derby = await createDerby(new Date(time), location_name);
  return NextResponse.json(derby, { status: 201 });
}
