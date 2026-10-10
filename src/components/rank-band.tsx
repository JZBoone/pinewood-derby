'use client';

import { RANKS } from '@/lib/ranks';
import { useRef, useState } from 'react';
import { useToast } from './toast';

interface RankBandProps {
  size: number;
  caption?: string;
  className?: string;
}

/**
 * One diamond per rank. Clicking them in order, Lion to Arrow of Light,
 * fires an arrow across the band.
 */
export default function RankBand({ size, caption, className }: RankBandProps) {
  const progress = useRef(0);
  const [arrows, setArrows] = useState(0);
  const showToast = useToast();
  // A rotated square is wider than its box, so pad it to keep the gap even.
  const overhang = Math.round(size * 0.21);

  function handleClick(index: number) {
    progress.current =
      index === progress.current ? progress.current + 1 : index === 0 ? 1 : 0;
    if (progress.current === RANKS.length) {
      progress.current = 0;
      setArrows((n) => n + 1);
      showToast('Arrow of Light! You traveled the whole trail.');
    }
  }

  return (
    <div
      className={`relative flex flex-wrap items-center gap-3.5 ${className ?? ''}`}
    >
      {RANKS.map((rank, index) => (
        <span
          key={rank.name}
          style={{ marginInline: overhang }}
          onClick={() => handleClick(index)}
        >
          <span
            title={rank.name}
            className="block rotate-45 rounded-[2px]"
            style={{
              width: size,
              height: size,
              background: rank.fill,
              boxShadow: `0 0 0 2px var(--bg), 0 0 0 3px ${rank.edge}`,
            }}
          />
        </span>
      ))}
      {caption && <span className="text-[13px] text-ink/65">{caption}</span>}
      {arrows > 0 && (
        <svg
          key={arrows}
          viewBox="0 0 120 20"
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-0 h-5 w-[120px] -translate-y-1/2 opacity-0 motion-safe:animate-[arrow-fly_1.4s_ease-in-out_forwards] motion-reduce:hidden"
          style={{ '--arrow-distance': '520px' } as React.CSSProperties}
        >
          <line
            x1={4}
            y1={10}
            x2={104}
            y2={10}
            stroke="var(--cs-yellow)"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <path d="M104 3 L118 10 L104 17 Z" fill="var(--cs-yellow)" />
          <path
            d="M4 10 L14 3 M4 10 L14 17 M12 10 L22 3 M12 10 L22 17"
            stroke="var(--cs-red)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
