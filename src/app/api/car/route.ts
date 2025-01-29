import { getCars } from '@/api-biz/car';
import { getDerbyById } from '@/api-biz/derby';
import { GetAllCarsResponse } from '@/lib/car';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const derbyIdRaw = url.searchParams.get('derby_id');

  if (!derbyIdRaw) {
    return NextResponse.json(
      { error: 'derby_id query parameter is required' },
      { status: 400 }
    );
  }
  const derbyId = Number(derbyIdRaw);

  if (isNaN(derbyId)) {
    return NextResponse.json(
      { error: 'derby_id must be a valid number' },
      { status: 400 }
    );
  }
  const derby = await getDerbyById(derbyId);
  if (!derby) {
    return NextResponse.json({ error: 'invalid derby_id' }, { status: 400 });
  }
  const cars = await getCars(derbyId);
  const response: GetAllCarsResponse = { cars: cars };
  return NextResponse.json(response);
}
