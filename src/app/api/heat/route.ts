import { db } from '@/api-biz/db';
import { getDerbyById } from '@/api-biz/derby';
import { postTimes } from '@/api-biz/heat';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/user';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

type Time = number | null;

type Headers = Awaited<ReturnType<typeof headers>>;

async function isValidApiKey(reqHeaders: Headers): Promise<boolean> {
  const authHeader = reqHeaders.get('authorization');
  const key = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;
  if (!key) {
    return false;
  }
  const apiKeyData = await auth.api.verifyApiKey({
    body: { key },
  });
  return apiKeyData.valid;
}

async function isValidAdminSession(reqHeaders: Headers): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  return !!session && isAdmin(session.user.role);
}

export async function POST(req: Request) {
  const reqHeaders = await headers();

  const [validatedApiKey, validatedAdminSession] = await Promise.all([
    isValidApiKey(reqHeaders),
    isValidAdminSession(reqHeaders),
  ]);

  if (!validatedApiKey && !validatedAdminSession) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();

  if (typeof body.derby_id !== 'number') {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  if (
    !Array.isArray(body.times) ||
    body.times.length !== 6 ||
    body.times.some((time: Time) => typeof time !== 'number' && time !== null)
  ) {
    return NextResponse.json({ error: 'Invalid times' }, { status: 400 });
  }

  const derby = await getDerbyById(body.derby_id);

  if (!derby) {
    return NextResponse.json({ error: 'Invalid derby_id' }, { status: 400 });
  }

  const heat = await db.heat.findFirst({
    where: { derby_id: derby.id, status: 'active' },
  });

  if (!heat) {
    return NextResponse.json({ error: 'No active heat' }, { status: 400 });
  }

  await postTimes(
    heat.id,
    body.times.map((time: Time) => (time === 0 ? null : time))
  );

  return NextResponse.json({ success: true });
}
