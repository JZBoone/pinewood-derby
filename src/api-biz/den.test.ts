import { derby } from '@prisma/client';
import { createDens, sortDens } from './den';
import { db } from './db';
import { DateTime } from 'luxon';
import { nowIsoString } from '@/lib/util';

describe('sortDens', () => {
  describe('sortDens', () => {
    const testCases = [
      {
        description: 'should sort dens by name in ascending order',
        input: [
          { id: 1, name: '6', sort_order: 1, derby_id: 1 },
          { id: 2, name: '3', sort_order: 2, derby_id: 1 },
          { id: 3, name: '5', sort_order: 3, derby_id: 1 },
          { id: 3, name: '8', sort_order: 4, derby_id: 1 },
          { id: 3, name: '1', sort_order: 5, derby_id: 1 },
          { id: 3, name: '99', sort_order: null, derby_id: 1 },
        ],
        expected: ['6', '3', '5', '8', '1', '99'],
      },
    ];

    test.each(testCases)('$description', ({ input, expected }) => {
      const sortedDens = sortDens(input);
      const sortedNames = sortedDens.map((den) => den.name);
      expect(sortedNames).toEqual(expected);
    });
  });
});

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
