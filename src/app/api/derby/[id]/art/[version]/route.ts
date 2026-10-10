import { getDerbyArtImage } from '@/api-biz/derby-art';
import { NextResponse } from 'next/server';

// The version segment only busts caches. The current image is always served.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; version: string }> }
) {
  const derbyId = parseInt((await params).id);
  if (isNaN(derbyId)) {
    return NextResponse.json({ error: 'Invalid derby id' }, { status: 400 });
  }

  const art = await getDerbyArtImage(derbyId);
  if (!art?.image_data || !art.image_type) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return new Response(art.image_data, {
    headers: {
      'Content-Type': art.image_type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
