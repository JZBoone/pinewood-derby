import { validateCsv } from '@/api-biz/csv';
import { db } from '@/api-biz/db';
import { nowIsoString } from '@/lib/util';
import { createTestApiKeyAuth } from '@/test-utils/auth';
import { derby } from '@generated/client';
import { readFileSync } from 'fs';
import { DateTime } from 'luxon';
import path from 'path';
import { fileURLToPath } from 'url';
import { mappedCsv, parsedCsv } from './pinewood-derby-2024';
import { POST } from './route';

// 2. Recreate __dirname for ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('validateCsv', () => {
  test('it maps parsed records', () => {
    const validationResult = validateCsv(parsedCsv);
    expect(validationResult).toEqual({ valid: true, data: mappedCsv });
  });
});

describe('POST /api/derby/csv', () => {
  let derby: derby;
  async function makeRequest(params: {
    derbyId?: number;
    csv: string;
    authorized?: boolean;
  }) {
    const { derbyId, csv, authorized = true } = params;
    let url = `http://localhost/api/derby/csv`;
    if (derbyId) {
      url += `?derby_id=${derbyId}`;
    }
    const headers = authorized
      ? (await createTestApiKeyAuth()).headers
      : new Headers();
    headers.set('Content-Type', 'text/csv');
    const req = new Request(url, {
      method: 'POST',
      headers,
      body: csv,
    });
    return POST(req);
  }
  beforeEach(async () => {
    derby = await db.derby.create({
      data: {
        time: DateTime.now().plus({ week: 1 }).toUTC().toISO(),
        created_at: nowIsoString(),
        location_name: 'Williams Elmentary',
      },
    });
  });
  test('it returns a 403 when unauthorized', async () => {
    const csv =
      "Car Number,Car Name,Scout,Den,Superlative\n1,,Kelan Brandt,1,Cubmaster's Choice";
    const res = await makeRequest({
      csv,
      derbyId: derby.id,
      authorized: false,
    });
    expect(res.status).toBe(403);
    expect(await db.car.count()).toBe(0);
  });
  describe('validation', () => {
    test('missing derby id', async () => {
      const csv =
        "Car Number,Car Name,Scout,Den,Superlative\n1,,Kelan Brandt,1,Cubmaster's Choice";
      const res = await makeRequest({ csv, derbyId: undefined });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toEqual({ error: 'Missing derby_id query parameter' });
    });
    test('invalid derby id', async () => {
      const csv =
        "Car Number,Car Name,Scout,Den,Superlative\n1,,Kelan Brandt,1,Cubmaster's Choice";
      const res = await makeRequest({ csv, derbyId: 999 });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toEqual({ error: 'Invalid derby_id' });
    });
    test('invalid car number', async () => {
      const csv =
        "Car Number,Car Name,Scout,Den,Superlative\nfoo,,Kelan Brandt,1,Cubmaster's Choice";
      const res = await makeRequest({ csv, derbyId: derby.id });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toEqual({ error: 'Invalid value for Car Number: foo' });
    });
    test('missing car number', async () => {
      const csv =
        "Car Number,Car Name,Scout,Den,Superlative\n,,Kelan Brandt,1,Cubmaster's Choice";
      const res = await makeRequest({ csv, derbyId: derby.id });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toEqual({ error: 'Missing required value for Car Number' });
    });
    test('missing den', async () => {
      const csv =
        "Car Number,Car Name,Scout,Den,Superlative\n1,,Kelan Brandt,,Cubmaster's Choice";
      const res = await makeRequest({ csv, derbyId: derby.id });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toEqual({ error: 'Missing required value for Den' });
    });
    test('invalid den', async () => {
      const csv =
        "Car Number,Car Name,Scout,Den,Superlative\n1,,Kelan Brandt,foo,Cubmaster's Choice";
      const res = await makeRequest({ csv, derbyId: derby.id });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toEqual({ error: 'Invalid value for Den: foo' });
    });
  });
  test('pinewood-derby-2024.csv', async () => {
    const csv = readFileSync(
      path.join(__dirname, './pinewood-derby-2024.csv'),
      'utf8'
    );
    const res = await makeRequest({ csv, derbyId: derby.id });
    expect(res.status).toBe(200);
    const { dens, cars, heats } = await res.json();
    expect(cars.length).toBe(43);
    expect(dens.length).toBe(6);
    expect(heats.length).toBe(54);
  });
});
