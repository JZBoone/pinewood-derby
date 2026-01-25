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
