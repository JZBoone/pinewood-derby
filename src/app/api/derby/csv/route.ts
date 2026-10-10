import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { processCsv, validateCsv } from '@/api-biz/csv';
import { db } from '@/api-biz/db';
import { authorizeApiKeyOrAdminSession } from '@/lib/api-auth';

export async function POST(req: Request) {
  const authResult = await authorizeApiKeyOrAdminSession(req.headers);
  if (!authResult.authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const text = await req.text();
  const url = new URL(req.url);
  const derbyId = Number(url.searchParams.get('derby_id'));
  if (!derbyId) {
    return NextResponse.json(
      { error: 'Missing derby_id query parameter' },
      { status: 400 }
    );
  }

  const derby = await db.derby.findUnique({ where: { id: derbyId } });
  if (!derby) {
    return NextResponse.json({ error: 'Invalid derby_id' }, { status: 400 });
  }

  const records = parse<Record<string, string>>(text, {
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

  const result = await processCsv({
    records: validationResult.data,
    derbyId: derbyId,
  });

  return NextResponse.json(result);
}
