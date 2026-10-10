'use client';

import Whale from './art/whale';
import { summonWhale } from './easter-eggs';

/**
 * A tiny whale for venues at Williams Elementary, home of the Williams
 * Whales. Renders nothing for other venues.
 */
export default function WilliamsWhale({ venue }: { venue: string }) {
  if (!/williams/i.test(venue)) {
    return null;
  }
  return (
    <button
      type="button"
      onClick={summonWhale}
      aria-label="Go Williams Whales!"
      title="Go Williams Whales!"
      className="ml-1.5 inline-flex size-7 items-center justify-center rounded-full align-middle hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] [&:hover>svg]:motion-safe:animate-[whale-wiggle_.6s_ease-in-out]"
    >
      <Whale className="h-[18px] w-[28px]" />
    </button>
  );
}
