import { derby_art } from '@generated/client';

export type FeaturedArt = {
  imageUrl: string;
  title: string | null;
  artist: string | null;
  den: string | null;
  bgColor: string | null;
};

export const DERBY_ART_MAX_BYTES = 4 * 1024 * 1024;

export const DERBY_ART_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

export type DerbyArtMetadata = Omit<derby_art, 'image_data'> & {
  has_image_data: boolean;
};

export function toFeaturedArt(art: DerbyArtMetadata): FeaturedArt | null {
  // Uploaded images are versioned by path so caches never serve a replaced one.
  const imageUrl = art.has_image_data
    ? `/api/derby/${art.derby_id}/art/${art.updated_at.getTime()}`
    : art.image_path;
  if (!imageUrl) {
    return null;
  }
  return {
    imageUrl,
    title: art.title,
    artist: art.artist,
    den: art.den,
    bgColor: art.bg_color,
  };
}

/**
 * Reduces a name to first name plus last initial ("James Miller" becomes
 * "James M."), since kids' full names are never shown.
 */
export function formatArtistName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  const first = parts[0];
  if (parts.length === 1) {
    return first;
  }
  const initial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${initial}.`;
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}
