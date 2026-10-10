import { getDerbyById } from '@/api-biz/derby';
import { getDerbyArt, upsertDerbyArt } from '@/api-biz/derby-art';
import { authorizeApiKeyOrAdminSession } from '@/lib/api-auth';
import {
  DERBY_ART_IMAGE_TYPES,
  DERBY_ART_MAX_BYTES,
  formatArtistName,
  isHexColor,
  toFeaturedArt,
} from '@/lib/derby-art';
import { NextResponse } from 'next/server';

function optionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim().slice(0, 80);
  return trimmed || null;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authorizeApiKeyOrAdminSession(req.headers);
  if (!authResult.authorized || authResult.method !== 'admin_session') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const derbyId = parseInt((await params).id);
  if (isNaN(derbyId) || !(await getDerbyById(derbyId))) {
    return NextResponse.json({ error: 'Invalid derby id' }, { status: 400 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json(
      { error: 'Expected multipart form data' },
      { status: 400 }
    );
  }

  const artist = formatArtistName(optionalText(form.get('artist')) ?? '');
  if (!artist) {
    return NextResponse.json({ error: 'artist is required' }, { status: 400 });
  }

  const bgColor = optionalText(form.get('bgColor'));
  if (bgColor && !isHexColor(bgColor)) {
    return NextResponse.json(
      { error: 'bgColor must be a hex color like #132150' },
      { status: 400 }
    );
  }

  let image: { data: Uint8Array<ArrayBuffer>; type: string } | undefined;
  const file = form.get('image');
  if (file instanceof File && file.size > 0) {
    if (!DERBY_ART_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'image must be a PNG, JPEG, WebP or GIF' },
        { status: 400 }
      );
    }
    if (file.size > DERBY_ART_MAX_BYTES) {
      return NextResponse.json(
        { error: 'image must be 4 MB or smaller' },
        { status: 400 }
      );
    }
    image = { data: new Uint8Array(await file.arrayBuffer()), type: file.type };
  }

  if (!image) {
    const existing = await getDerbyArt(derbyId);
    if (!existing || !toFeaturedArt(existing)) {
      return NextResponse.json({ error: 'image is required' }, { status: 400 });
    }
  }

  const art = await upsertDerbyArt(derbyId, {
    image,
    title: optionalText(form.get('title')),
    artist,
    den: optionalText(form.get('den')),
    bgColor,
  });

  return NextResponse.json({ featured_art: art && toFeaturedArt(art) });
}
