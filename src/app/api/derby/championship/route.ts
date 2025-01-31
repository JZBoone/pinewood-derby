import { getChampionships, makeChampionships } from '@/api-biz/championship';
import { getDerbyById } from '@/api-biz/derby';
import { ChampionshipsData } from '@/lib/championships';
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
  const { heats, cars } = await getChampionships(derbyId);
  const response: ChampionshipsData = { cars, heats, derby };
  return NextResponse.json(response);
}
