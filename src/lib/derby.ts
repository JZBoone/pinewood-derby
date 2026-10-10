import { derby } from '@generated/client';
import { FeaturedArt } from './derby-art';

export type GetDerbiesResponse = {
  derbies: derby[];
};

export type GetDerbyByIdResponse = {
  derby: derby | null;
  featured_art: FeaturedArt | null;
};

export function formatRaceDay(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
}
