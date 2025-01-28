import { den } from '@prisma/client';
import { db } from './db';

export async function upsertDen(params: {
  derbyId: number;
  denNumber: number;
}): Promise<{ result: 'created' | 'found'; den: den }> {
  const den = await db.den.findFirst({
    where: { derby_id: params.derbyId, name: params.denNumber.toString() },
  });
  if (den) {
    return { result: 'found', den };
  }
  const createdDen = await db.den.create({
    data: {
      derby_id: params.derbyId,
      name: params.denNumber.toString(),
    },
  });
  return { result: 'created', den: createdDen };
}

export async function upsertDens(params: {
  derbyId: number;
  denNumbers: number[];
}): Promise<{ createdCount: number; foundCount: number; dens: den[] }> {
  const results = await Promise.all(
    params.denNumbers.map((denNumber) =>
      upsertDen({ derbyId: params.derbyId, denNumber })
    )
  );

  const createdCount = results.filter(
    (result) => result.result === 'created'
  ).length;
  const foundCount = results.filter(
    (result) => result.result === 'found'
  ).length;
  const dens = results.map((result) => result.den);

  return { createdCount, foundCount, dens };
}
