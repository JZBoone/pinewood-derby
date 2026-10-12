'use client';

import { playSound, primeSound } from '@/lib/sound';
import { useEffect, useRef } from 'react';

// "Boing" by freesound_community, from Pixabay:
// https://pixabay.com/sound-effects/search/boing/
const BONK_SOUND = '/sounds/boing.mp3';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'tent-scout': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

/**
 * The blue footer tent. Knocking on its door brings out a Cub Scout with a
 * slingshot, and the pebble's BONK plays a boing. The custom element only loads in the browser, so the static
 * tent shows until it takes over.
 */
export default function TentScout({ className }: { className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    import('./tent-scout.js');
    const tent = ref.current;
    if (!tent) {
      return;
    }
    // The BONK lands about two seconds after the knock, so unlock the sound
    // during the knock itself for iOS.
    const prime = () => primeSound(BONK_SOUND);
    const bonk = () => playSound(BONK_SOUND);
    tent.addEventListener('click', prime);
    tent.addEventListener('keydown', prime);
    tent.addEventListener('bonk', bonk);
    return () => {
      tent.removeEventListener('click', prime);
      tent.removeEventListener('keydown', prime);
      tent.removeEventListener('bonk', bonk);
    };
  }, []);

  return (
    <tent-scout
      ref={ref}
      className={className}
      style={{ '--tent-width': '190px' } as React.CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/campsite/tent-blue.svg"
        alt=""
        width={190}
        height={129}
        className="h-auto w-full"
      />
    </tent-scout>
  );
}
