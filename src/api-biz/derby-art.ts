import { db } from '@/api-biz/db';
import { DerbyArtMetadata } from '@/lib/derby-art';

export async function getDerbyArt(
  derbyId: number
): Promise<DerbyArtMetadata | null> {
  const rows = await db.$queryRaw<DerbyArtMetadata[]>`
    SELECT derby_id, updated_at, image_type, image_path, title, artist, den,
      bg_color, image_data IS NOT NULL AS has_image_data
    FROM derby_art
    WHERE derby_id = ${derbyId}`;
  return rows[0] ?? null;
}

export async function getDerbyArtImage(derbyId: number) {
  return db.derby_art.findUnique({
    where: { derby_id: derbyId },
    select: { image_data: true, image_type: true },
  });
}

export type UpsertDerbyArtParams = {
  image?: { data: Uint8Array<ArrayBuffer>; type: string };
  title: string | null;
  artist: string;
  den: string | null;
  bgColor: string | null;
};

export async function upsertDerbyArt(
  derbyId: number,
  params: UpsertDerbyArtParams
) {
  const fields = {
    title: params.title,
    artist: params.artist,
    den: params.den,
    bg_color: params.bgColor,
    ...(params.image && {
      image_data: params.image.data,
      image_type: params.image.type,
      image_path: null,
    }),
  };
  await db.derby_art.upsert({
    where: { derby_id: derbyId },
    create: { derby_id: derbyId, ...fields },
    update: fields,
  });
  return getDerbyArt(derbyId);
}
