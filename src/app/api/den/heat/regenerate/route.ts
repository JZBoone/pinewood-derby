import { getDenById } from '@/api-biz/den';
import { regenerateHeatsForDen } from '@/api-biz/heat';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  if (typeof body.den_id !== 'number') {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const den = await getDenById(body.den_id);

  if (!den) {
    return NextResponse.json({ error: 'Invalid den_id' }, { status: 400 });
  }

  const heats = await regenerateHeatsForDen({
    denId: den.id,
    derbyId: den.derby_id,
  });

  return NextResponse.json({ heats });
}
