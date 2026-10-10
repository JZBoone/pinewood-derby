import { db } from '@/api-biz/db';
import { createTestApiKeyAuth } from '@/test-utils/auth';
import { den } from '@generated/client';
import { POST } from './route';

describe('POST /api/den/heat/regenerate', () => {
  let testDen: den;

  beforeEach(async () => {
    const derby = await db.derby.create({
      data: {
        time: new Date(),
        created_at: new Date(),
        location_name: 'Test Location',
      },
    });
    testDen = await db.den.create({
      data: { name: '6', derby_id: derby.id },
    });
    for (const number of [1, 2, 3]) {
      await db.car.create({
        data: { den_id: testDen.id, number, owner: `Scout ${number}` },
      });
    }
  });

  async function regenerate(headers: Headers) {
    headers.set('Content-Type', 'application/json');
    return POST(
      new Request('http://localhost/api/den/heat/regenerate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ den_id: testDen.id }),
      })
    );
  }

  test('it regenerates heats when authorized', async () => {
    const { headers } = await createTestApiKeyAuth();
    const res = await regenerate(headers);
    expect(res.status).toBe(200);
    expect(await db.heat.count({ where: { den_id: testDen.id } })).toBe(
      (await res.json()).heats.length
    );
  });

  test('it returns a 403 when unauthorized', async () => {
    const res = await regenerate(new Headers());
    expect(res.status).toBe(403);
    expect(await db.heat.count()).toBe(0);
  });
});
