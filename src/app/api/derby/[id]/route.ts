import { NextResponse } from 'next/server';
import { deleteDerby, getDerbyById } from '@/api-biz/derby';
import { GetDerbyByIdResponse } from '@/lib/derby';
import { authorizeApiKeyOrAdminSession } from '@/lib/api-auth';
import { headers } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const derby = await getDerbyById(id);
  const response: GetDerbyByIdResponse = { derby: derby };
  return NextResponse.json(response);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const reqHeaders = await headers();
  const authResult = await authorizeApiKeyOrAdminSession(reqHeaders);
  if (!authResult.authorized || authResult.method !== 'admin_session') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const derby = await getDerbyById(id);
  if (!derby) {
    return NextResponse.json({ error: 'Invalid derby_id' }, { status: 400 });
  }

  const result = await deleteDerby(id);

  return NextResponse.json({
    ok: true,
    deletedHeats: result.deletedHeats,
    deletedCars: result.deletedCars,
    deletedDens: result.deletedDens,
  });
}
