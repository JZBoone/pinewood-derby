import { derby } from '@prisma/client';
import { upsertDen, upsertDens } from './den';
import { db } from './db';
import { DateTime } from 'luxon';
import { nowIsoString } from '@/lib/util';

describe('dens', () => {
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
  describe('upsertDen', () => {
    it('should create a new den if it does not exist', async () => {
      const params = { derbyId: derby.id, denNumber: 101 };
      const result = await upsertDen(params);

      expect(result.result).toBe('created');
      expect(result.den.derby_id).toBe(derby.id);
      expect(result.den.name).toBe('101');
    });

    it('should find an existing den if it exists', async () => {
      const params = { derbyId: derby.id, denNumber: 101 };
      await upsertDen(params); // Create the den first

      const result = await upsertDen(params);

      expect(result.result).toBe('found');
      expect(result.den.derby_id).toBe(derby.id);
      expect(result.den.name).toBe('101');
    });
  });

  describe('upsertDens', () => {
    it('should create multiple new dens if they do not exist', async () => {
      const params = { derbyId: derby.id, denNumbers: [101, 102, 103] };
      const result = await upsertDens(params);

      expect(result.createdCount).toBe(3);
      expect(result.foundCount).toBe(0);
      expect(result.dens.length).toBe(3);
    });

    it('should find existing dens and create new ones if mixed', async () => {
      const params = { derbyId: derby.id, denNumbers: [101, 102] };
      await upsertDen({ derbyId: derby.id, denNumber: 101 }); // Create one den first

      const result = await upsertDens(params);

      expect(result.createdCount).toBe(1);
      expect(result.foundCount).toBe(1);
      expect(result.dens.length).toBe(2);
    });
  });
});
