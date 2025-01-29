import { getHeatById, postTimes } from '@/api-biz/heat';
import { NextResponse } from 'next/server';

type Time = number | null | 'DNF';

export async function POST(req: Request) {
  const body = await req.json();

  if (typeof body.id !== 'number') {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  if (
    !Array.isArray(body.times) ||
    body.times.length !== 6 ||
    body.times.some(
      (time: Time) =>
        typeof time !== 'number' && time !== null && time !== 'DNF'
    )
  ) {
    return NextResponse.json({ error: 'Invalid times' }, { status: 400 });
  }

  const heat = await getHeatById(body.id);

  if (!heat) {
    return NextResponse.json({ error: 'Invalid heat id' }, { status: 400 });
  }

  await postTimes(
    body.id,
    body.times.map((time: Time) => (time === 'DNF' ? null : time))
  );

  return NextResponse.json({ success: true });
}
