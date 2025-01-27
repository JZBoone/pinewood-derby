import { db } from '@/api-biz/db';

export async function getAllDerbies() {
  return db.derby.findMany({ orderBy: { created_at: 'desc' } });
}

export async function getDerbyById(id: number) {
  return db.derby.findUnique({ where: { id } });
}
