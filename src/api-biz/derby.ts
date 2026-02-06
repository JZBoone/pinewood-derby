import { db } from '@/api-biz/db';

export async function getAllDerbies() {
  return db.derby.findMany({ orderBy: { created_at: 'desc' } });
}

export async function getDerbyById(id: number) {
  return db.derby.findUnique({ where: { id } });
}

export async function createDerby(time: Date, location_name: string) {
  return db.derby.create({
    data: {
      time,
      location_name,
      created_at: new Date(),
    },
  });
}

export async function deleteDerby(derbyId: number) {
  const dens = await db.den.findMany({ where: { derby_id: derbyId } });
  const denIds = dens.map((den) => den.id);
  const cars =
    denIds.length === 0
      ? []
      : await db.car.findMany({ where: { den_id: { in: denIds } } });

  const operations = [db.heat.deleteMany({ where: { derby_id: derbyId } })];

  if (denIds.length > 0) {
    operations.push(
      db.car.deleteMany({ where: { den_id: { in: denIds } } })
    );
  }

  operations.push(
    db.den.deleteMany({ where: { derby_id: derbyId } }),
    db.derby.delete({ where: { id: derbyId } })
  );

  const results = await db.$transaction(operations);
  const deletedHeats = results[0];
  const deletedCars =
    denIds.length > 0 ? results[1] : { count: 0 };
  const deletedDens = results[denIds.length > 0 ? 2 : 1];

  return {
    dens,
    cars,
    deletedHeats: deletedHeats.count,
    deletedCars: deletedCars.count,
    deletedDens: deletedDens.count,
  };
}
