import { getDerbyById } from '@/api-biz/derby';
import { getDerbyHeats } from '@/api-biz/heat';
import { GetDerbyHeatsResponse } from '@/lib/heat';
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
  const heats = await getDerbyHeats(derbyId);
  const response: GetDerbyHeatsResponse = { heats: heats };
  return NextResponse.json(response);
}
