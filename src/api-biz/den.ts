import { den } from '@generated/client';
import { db } from './db';

/**
 * Sort dens by name. We want the younger dens to go first, so sorting is important.
 */
export function sortDens<T extends { sort_order: number | null }>(
  dens: T[]
): T[] {
  return dens.sort(
    (a, b) => (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity)
  );
}

/**
 * idempotent
 */
export async function createDens(params: {
  derbyId: number;
  denNumbers: number[];
}): Promise<{ createdCount: number; foundCount: number; dens: den[] }> {
  const dens = await db.den.findMany({ where: { derby_id: params.derbyId } });
  const densToCreate = params.denNumbers.filter(
    (denNumber) => !dens.some((den) => den.name === denNumber.toString())
  );
  const createdDens = await Promise.all(
    densToCreate.map((denNumber) =>
      db.den.create({
        data: {
          derby_id: params.derbyId,
          name: denNumber.toString(),
        },
      })
    )
  );

  return {
    createdCount: createdDens.length,
    foundCount: dens.length,
    dens: [...dens, ...createdDens],
  };
}

/**
 * Get all dens for a specific derby.
 */
export async function getDens(derbyId: number): Promise<den[]> {
  return db.den.findMany({ where: { derby_id: derbyId } });
}

export async function getDenById(id: number) {
  return db.den.findUnique({ where: { id } });
}
