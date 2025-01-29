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
          { id: 1, name: '102', derby_id: 1 },
          { id: 2, name: '101', derby_id: 1 },
          { id: 3, name: '103', derby_id: 1 },
        ],
        expected: ['101', '102', '103'],
      },
      {
        description: 'should handle dens with non-numeric names',
        input: [
          { id: 1, name: 'A', derby_id: 1 },
          { id: 2, name: 'B', derby_id: 1 },
          { id: 3, name: 'C', derby_id: 1 },
        ],
        expected: ['A', 'B', 'C'],
      },
    ];

    test.only.each(testCases)('$description', ({ input, expected }) => {
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
