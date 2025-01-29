import { car } from '@prisma/client';
import { db } from './db';
import { DeserializedCsvRecord } from './csv';

/**
 * not idempotent!
 */
export async function createCars(params: {
  derbyId: number;
  records: DeserializedCsvRecord[];
}): Promise<{ cars: car[] }> {
  const { derbyId, records } = params;
  const denNumbers = Array.from(new Set(records.map((r) => r.denNumber))).map(
    (n) => n.toString()
  );
  const dens = await db.den.findMany({
    where: { derby_id: derbyId, name: { in: denNumbers } },
  });
  if (
    records.some((r) => !dens.some((d) => d.name === r.denNumber.toString()))
  ) {
    throw new Error('One or more cars references a den that does not exist');
  }
  const cars = await Promise.all(
    records.map((r) =>
      db.car.create({
        data: {
          den_id: dens.find((d) => d.name === r.denNumber.toString())!.id,
          number: r.carNumber,
          name: r.carName,
          owner: r.owner,
          superlative: r.superlative,
        },
      })
    )
  );
  return { cars };
}

/**
 * Get all cars for a derby
 */
export async function getCars(derbyId: number): Promise<car[]> {
  const dens = await db.den.findMany({
    where: { derby_id: derbyId },
    select: { id: true },
  });
  const denIds = dens.map((den) => den.id);
  return db.car.findMany({ where: { den_id: { in: denIds } } });
}
