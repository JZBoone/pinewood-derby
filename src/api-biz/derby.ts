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
  return db.$transaction(async (tx) => {
    const dens = await tx.den.findMany({ where: { derby_id: derbyId } });
    const denIds = dens.map((den) => den.id);
    const cars =
      denIds.length === 0
        ? []
        : await tx.car.findMany({ where: { den_id: { in: denIds } } });

    const deletedHeats = await tx.heat.deleteMany({
      where: { derby_id: derbyId },
    });

    const deletedCars =
      denIds.length === 0
        ? { count: 0 }
        : await tx.car.deleteMany({ where: { den_id: { in: denIds } } });

    const deletedDens = await tx.den.deleteMany({
      where: { derby_id: derbyId },
    });

    await tx.derby.delete({ where: { id: derbyId } });

    return {
      dens,
      cars,
      deletedHeats: deletedHeats.count,
      deletedCars: deletedCars.count,
      deletedDens: deletedDens.count,
    };
  });
}
