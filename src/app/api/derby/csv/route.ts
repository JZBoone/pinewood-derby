import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { validateCsv } from '@/api-biz/csv';

export async function POST(req: Request) {
  const text = await req.text();

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
