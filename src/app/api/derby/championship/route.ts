import { makeChampionships } from '@/api-biz/championship';
import { getDerbyById } from '@/api-biz/derby';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  if (typeof body.derby_id !== 'number') {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const derby = await getDerbyById(body.derby_id);

  if (!derby) {
    return NextResponse.json({ error: 'Invalid derby_id' }, { status: 400 });
  }

  const heats = await makeChampionships(body.derby_id);

  return NextResponse.json({ heats });
}
