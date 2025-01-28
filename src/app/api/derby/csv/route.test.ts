import { readFileSync } from 'fs';
import path from 'path';
import { expectedResponse, mappedCsv, parsedCsv } from './pinewood-derby-2024';
import { POST } from './route';
import { validateCsv } from '@/api-biz/csv';

async function makeRequest(csv: string) {
  const req = new Request('http://localhost/api/derby/csv', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/csv',
    },
    body: csv,
  });
  return POST(req);
}

describe('validateCsv', () => {
  test('it maps parsed records', () => {
    const validationResult = validateCsv(parsedCsv);
    expect(validationResult).toEqual({ valid: true, data: mappedCsv });
  });
});

describe('POST /api/derby/csv', () => {
  describe('validation', () => {
    test('invalid car number', async () => {
      const csv =
        "Car Number,Car Name,Scout,Den,Superlative\nfoo,,Kelan Brandt,1,Cubmaster's Choice";
      const res = await makeRequest(csv);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toEqual({ error: 'Invalid value for Car Number: foo' });
    });
    test('missing car number', async () => {
      const csv =
        "Car Number,Car Name,Scout,Den,Superlative\n,,Kelan Brandt,1,Cubmaster's Choice";
      const res = await makeRequest(csv);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toEqual({ error: 'Missing required value for Car Number' });
    });
    test('missing den', async () => {
      const csv =
        "Car Number,Car Name,Scout,Den,Superlative\n1,,Kelan Brandt,,Cubmaster's Choice";
      const res = await makeRequest(csv);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toEqual({ error: 'Missing required value for Den' });
    });
    test('invalid den', async () => {
      const csv =
        "Car Number,Car Name,Scout,Den,Superlative\n1,,Kelan Brandt,foo,Cubmaster's Choice";
      const res = await makeRequest(csv);
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
    const res = await makeRequest(csv);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(expectedResponse);
  });
});
