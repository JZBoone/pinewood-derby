'use client';

import { useEffect, useState } from 'react';
import PinewoodCar from './art/pinewood-car';
import Whale from './art/whale';
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

const WHALE_WORD = 'whale';

export const WHALE_EVENT = 'pack272:whale';

/** Sends the Williams Whales whale across the screen. */
export function summonWhale() {
  window.dispatchEvent(new Event(WHALE_EVENT));
}

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

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
 * Site-wide easter eggs. The Konami code sends a parade of pinewood cars
 * across the screen, and typing "whale" (or summonWhale) sends the Williams
 * Whales whale swimming by.
 */
export default function EasterEggs() {
  const [parade, setParade] = useState(0);
  const [whale, setWhale] = useState(0);
  const showToast = useToast();

  useEffect(() => {
    console.log(
      '%cPack 272 Pinewood Derby%c\nPsst, scout: try ↑ ↑ ↓ ↓ ← → ← → B A',
      'font: 700 16px sans-serif; color: #c62232',
      'font: 13px sans-serif'
    );

    let progress = 0;
    let typed = '';
    function handleWhale() {
      setWhale((n) => n + 1);
      showToast('Go Williams Whales!');
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) {
        return;
      }
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      typed = (typed + (key.length === 1 ? key : ' ')).slice(
        -WHALE_WORD.length
      );
      if (typed === WHALE_WORD) {
        typed = '';
        handleWhale();
      }
      progress =
        key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        setParade((n) => n + 1);
        showToast('Pinewood parade! Every car gets a victory lap.');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener(WHALE_EVENT, handleWhale);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(WHALE_EVENT, handleWhale);
    };
  }, [showToast]);

  useEffect(() => {
    if (parade === 0) {
      return;
    }
    const timeout = setTimeout(() => setParade(0), 6_000);
    return () => clearTimeout(timeout);
  }, [parade]);

  useEffect(() => {
    if (whale === 0) {
      return;
    }
    const timeout = setTimeout(() => setWhale(0), 7_000);
    return () => clearTimeout(timeout);
  }, [whale]);

  return (
    <>
      {parade > 0 && <Parade run={parade} />}
      {whale > 0 && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 bottom-20 z-40 h-36 overflow-hidden motion-reduce:hidden"
        >
          <div
            key={whale}
            className="absolute bottom-2 left-0 animate-[whale-swim_6s_ease-in-out_forwards]"
            style={{ transform: 'translateX(-260px)' }}
          >
            <Whale spouting className="h-[130px] w-[208px]" />
          </div>
        </div>
      )}
    </>
  );
}

function Parade({ run }: { run: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-24 z-40 h-16 overflow-hidden motion-reduce:hidden"
    >
      {PARADE.map((color, i) => (
        <div
          key={`${run}-${color}`}
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
