import { db } from '@/api-biz/db';
import { DateTime } from 'luxon';
import { GET } from './route';

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
