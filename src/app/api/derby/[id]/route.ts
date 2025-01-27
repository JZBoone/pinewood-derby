import { NextResponse } from 'next/server';
import { getDerbyById } from '@/api-biz/derby';
import { GetDerbyByIdResponse } from '@/lib/derby';

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
