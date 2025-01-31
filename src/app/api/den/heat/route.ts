import { getDenCars } from '@/api-biz/car';
import { getDenById } from '@/api-biz/den';
import { getDenHeats } from '@/api-biz/heat';
import { GetDenHeatsResponse } from '@/lib/heat';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const denIdRaw = url.searchParams.get('den_id');

  if (!denIdRaw) {
    return NextResponse.json(
      { error: 'derby_id query parameter is required' },
      { status: 400 }
    );
  }
  const denId = Number(denIdRaw);

  if (isNaN(denId)) {
    return NextResponse.json(
      { error: 'den_id must be a valid number' },
      { status: 400 }
    );
  }
  const den = await getDenById(denId);
  if (!den) {
    return NextResponse.json({ error: 'invalid den_id' }, { status: 400 });
  }
  const [heats, cars] = await Promise.all([
    getDenHeats(denId),
    getDenCars(denId),
  ]);
  const response: GetDenHeatsResponse = { heats: heats, den, cars };
  return NextResponse.json(response);
}
