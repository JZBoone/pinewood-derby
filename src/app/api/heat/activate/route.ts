import { getDerbyById } from '@/api-biz/derby';
import { activate, getHeatById } from '@/api-biz/heat';
import { authorizeApiKeyOrAdminSession } from '@/lib/api-auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const reqHeaders = await headers();
  const authResult = await authorizeApiKeyOrAdminSession(reqHeaders);
  if (!authResult.authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();

  if (typeof body.id !== 'number' || typeof body.derby_id !== 'number') {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const [heat, derby] = await Promise.all([
    getHeatById(body.id),
    getDerbyById(body.derby_id),
  ]);

  if (!heat) {
    return NextResponse.json({ error: 'Invalid heat id' }, { status: 400 });
  }

  if (!derby) {
    return NextResponse.json({ error: 'Invalid derby_id' }, { status: 400 });
  }
  await activate(derby.id, heat.id);

  return NextResponse.json({ success: true });
}
