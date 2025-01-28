import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { validateCsv } from '@/api-biz/csv';
import { db } from '@/api-biz/db';

export async function POST(req: Request) {
  const text = await req.text();
  const url = new URL(req.url);
  const derbyId = url.searchParams.get('derby_id');
  if (!derbyId) {
    return NextResponse.json(
      { error: 'Missing derby_id query parameter' },
      { status: 400 }
    );
  }

  const derby = await db.derby.findUnique({ where: { id: Number(derbyId) } });
  if (!derby) {
    return NextResponse.json({ error: 'Invalid derby_id' }, { status: 400 });
  }

  const records = parse(text, {
    columns: true, // Treat the first row as column headers
    skip_empty_lines: true,
  });

  const validationResult = validateCsv(records);
  if (!validationResult.valid) {
    return NextResponse.json(
      { error: validationResult.error },
      { status: 400 }
    );
  }

  return NextResponse.json({ data: validationResult.data });
}
