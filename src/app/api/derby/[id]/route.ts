import { getDerbyById } from '@/api-biz/derby';
import { GetDerbyByIdResponse } from '@/lib/derby';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const derby = await getDerbyById(id);
  const response: GetDerbyByIdResponse = { derby: derby };
  return NextResponse.json(response);
}
