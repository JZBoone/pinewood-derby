'use client';

import { useEffect, useState } from 'react';
import PinewoodCar from './art/pinewood-car';
import { useToast } from './toast';

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

const PARADE = [
  '#c62232',
  '#f5b919',
  '#7fb5de',
  '#e8671c',
  '#1f3a80',
  '#c98a4b',
  '#2e8b57',
  '#c9ccd6',
];

/**
 * Site-wide easter eggs: the Konami code sends a parade of pinewood cars
 * across the screen.
 */
export default function EasterEggs() {
  const [parade, setParade] = useState(0);
  const showToast = useToast();

  useEffect(() => {
    console.log(
      '%cPack 272 Pinewood Derby%c\nPsst, scout: try ↑ ↑ ↓ ↓ ← → ← → B A',
      'font: 700 16px sans-serif; color: #c62232',
      'font: 13px sans-serif'
    );

    let progress = 0;
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      progress =
        key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        setParade((n) => n + 1);
        showToast('Pinewood parade! Every car gets a victory lap.');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToast]);

  useEffect(() => {
    if (parade === 0) {
      return;
    }
    const timeout = setTimeout(() => setParade(0), 6_000);
    return () => clearTimeout(timeout);
  }, [parade]);

  if (parade === 0) {
    return null;
  }
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-24 z-40 h-16 overflow-hidden motion-reduce:hidden"
    >
      {PARADE.map((color, i) => (
        <div
          key={`${parade}-${color}`}
          className="absolute bottom-0 left-0 animate-[parade-drive_3.2s_linear_forwards]"
          style={{
            animationDelay: `${i * 0.28}s`,
            transform: 'translateX(-220px)',
          }}
        >
          <PinewoodCar
            color={color}
            number={String(272 - i * 27)}
            rolling
            className="h-12 w-[120px]"
          />
        </div>
      ))}
    </div>
  );
}
