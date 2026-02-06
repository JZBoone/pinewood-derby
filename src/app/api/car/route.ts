import { createCar, deleteCar, getDerbyCars } from '@/api-biz/car';
import { getDerbyById } from '@/api-biz/derby';
import { authorizeApiKeyOrAdminSession } from '@/lib/api-auth';
import { GetCarsResponse } from '@/lib/car';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

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
  const cars = await getDerbyCars(derbyId);
  const response: GetCarsResponse = { cars: cars };
  return NextResponse.json(response);
}

export async function POST(req: Request) {
  const reqHeaders = await headers();
  const authResult = await authorizeApiKeyOrAdminSession(reqHeaders);
  if (!authResult.authorized || authResult.method !== 'admin_session') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { denId, carNumber, carName, owner } = await req.json();

  if (!denId || !carNumber || !owner) {
    return NextResponse.json(
      { error: 'denId, carNumber, and owner are required' },
      { status: 400 }
    );
  }

  const result = await createCar({
    denId,
    carNumber,
    carName,
    owner,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json(result.car, { status: 201 });
}

export async function DELETE(req: Request) {
  const reqHeaders = await headers();
  const authResult = await authorizeApiKeyOrAdminSession(reqHeaders);
  if (!authResult.authorized || authResult.method !== 'admin_session') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const carIdRaw = url.searchParams.get('id');

  if (!carIdRaw) {
    return NextResponse.json(
      { error: 'id query parameter is required' },
      { status: 400 }
    );
  }
  const carId = Number(carIdRaw);

  if (isNaN(carId)) {
    return NextResponse.json(
      { error: 'id must be a valid number' },
      { status: 400 }
    );
  }

  await deleteCar(carId);

  return new Response(null, { status: 204 });
}
