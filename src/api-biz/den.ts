import { den } from '@prisma/client';
import { db } from './db';

/**
 * Sort dens by name. We want the younger dens to go first, so sorting is important.
 */
export function sortDens<T extends { name: string }>(dens: T[]): T[] {
  return dens.sort((a, b) => parseInt(a.name) - parseInt(b.name));
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
