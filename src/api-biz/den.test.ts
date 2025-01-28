import { derby } from '@prisma/client';
import { createDens } from './den';
import { db } from './db';
import { DateTime } from 'luxon';
import { nowIsoString } from '@/lib/util';

describe('createDens', () => {
  let derby: derby;
  beforeEach(async () => {
    derby = await db.derby.create({
      data: {
        time: DateTime.now().plus({ week: 1 }).toUTC().toISO(),
        created_at: nowIsoString(),
        location_name: 'Williams Elmentary',
      },
    });
  });

  it('should create multiple new dens if they do not exist', async () => {
    const params = { derbyId: derby.id, denNumbers: [101, 102, 103] };
    const result = await createDens(params);

    expect(result.createdCount).toBe(3);
    expect(result.foundCount).toBe(0);
    expect(result.dens.length).toBe(3);
  });

  it('should find existing dens and create new ones if mixed', async () => {
    const params = { derbyId: derby.id, denNumbers: [101, 102] };
    // Create one den first
    await db.den.create({
      data: {
        derby_id: params.derbyId,
        name: '101',
      },
    });

    const result = await createDens(params);

    expect(result.createdCount).toBe(1);
    expect(result.foundCount).toBe(1);
    expect(result.dens.length).toBe(2);
  });
});
