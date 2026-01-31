import { db } from '@/api-biz/db';
import { DateTime } from 'luxon';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

describe('GET /api/derby', () => {
  beforeEach(async () => {
    await db.derby.create({
      data: {
        time: DateTime.now().plus({ week: 1 }).toUTC().toISO(),
        created_at: DateTime.now().toUTC().toISO(),
        location_name: 'Williams Elmentary',
      },
    });
  });
  test('it returns all derbies', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.derbies.length).toBe(1);
  });
});

describe('POST /api/derby', () => {
  test('it creates a new derby', async () => {
    const time = DateTime.now().plus({ days: 3 }).toUTC().toISO();
    const location_name = 'New Location';

    const request = new NextRequest('http://localhost/api/derby', {
      method: 'POST',
      body: JSON.stringify({ time, location_name }),
    });

    const res = await POST(request);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBeDefined();
    expect(json.created_at).toBeDefined();
    expect(json.location_name).toBe(location_name);
  });

  test('it returns a 400 for an invalid payload', async () => {
    const request = new NextRequest('http://localhost/api/derby', {
      method: 'POST',
      body: JSON.stringify({ time: new Date() }),
    });

    const res = await POST(request);
    expect(res.status).toBe(400);
  });
});
