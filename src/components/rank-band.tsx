'use client';

import { RANKS } from '@/lib/ranks';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useToast } from './toast';

interface RankBandProps {
  size: number;
  caption?: string;
  className?: string;
}

/**
 * One diamond per rank. Tapping a diamond shows a fun fact about that rank.
 * Tapping them in order, Lion to Arrow of Light, also fires an arrow across
 * the band.
 */
export default function RankBand({ size, caption, className }: RankBandProps) {
  const progress = useRef(0);
  const [arrows, setArrows] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [caretLeft, setCaretLeft] = useState(0);
  const bandRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const showToast = useToast();
  // A rotated square is wider than its box, so pad it to keep the gap even.
  const overhang = Math.round(size * 0.21);

  useEffect(() => {
    if (open === null) {
      return;
    }
    function handlePointerDown(event: PointerEvent) {
      if (!bandRef.current?.contains(event.target as Node)) {
        setOpen(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(null);
        buttonRefs.current[open ?? 0]?.focus();
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleClick(index: number) {
    const button = buttonRefs.current[index];
    if (button) {
      setCaretLeft(button.offsetLeft + button.offsetWidth / 2);
    }
    setOpen((current) => (current === index ? null : index));

    progress.current =
      index === progress.current ? progress.current + 1 : index === 0 ? 1 : 0;
    if (progress.current === RANKS.length) {
      progress.current = 0;
      setArrows((n) => n + 1);
      showToast('Arrow of Light! You traveled the whole trail.');
    }
  }

  const rank = open === null ? null : RANKS[open];

  return (
    <div
      ref={bandRef}
      className={`relative flex flex-wrap items-center gap-3.5 ${className ?? ''}`}
    >
      {RANKS.map((r, index) => (
        <button
          key={r.name}
          ref={(el) => {
            buttonRefs.current[index] = el;
          }}
          type="button"
          aria-label={`${r.name} fun fact`}
          aria-expanded={open === index}
          aria-controls="rank-fact"
          title={r.name}
          onClick={() => handleClick(index)}
          className="group -m-1 rounded-sm p-1 focus-visible:outline-offset-4"
          style={{ marginInline: overhang - 4 }}
        >
          <span
            className={`block rotate-45 rounded-[2px] transition-transform group-hover:scale-110 ${
              open === index ? 'scale-125' : ''
            }`}
            style={{
              width: size,
              height: size,
              background: r.fill,
              boxShadow: `0 0 0 2px var(--bg), 0 0 0 3px ${r.edge}`,
            }}
          />
        </button>
      ))}
      {caption && (
        <span className="text-[13px] text-balance text-ink/65">{caption}</span>
      )}
      {rank && (
        <div
          id="rank-fact"
          role="region"
          aria-label={`${rank.name} fun fact`}
          className="absolute top-full left-0 z-30 mt-3.5 w-[min(340px,calc(100vw-32px))] rounded-md border border-l-4 border-accent/35 bg-surface p-4 pr-10 text-ink shadow-[0_10px_28px_color-mix(in_srgb,#0c1638_25%,transparent)] dark:bg-[#26407f] dark:shadow-[0_10px_28px_rgb(0_0_0/45%)]"
          style={{
            borderLeftColor: rank.fill === '#1a2b5c' ? rank.edge : rank.fill,
          }}
        >
          <span
            aria-hidden
            className="absolute -top-[7px] size-3 rotate-45 border-t border-l border-accent/35 bg-surface dark:bg-[#26407f]"
            style={{ left: Math.max(12, Math.min(caretLeft - 6, 310)) }}
          />
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="block size-3 shrink-0 rotate-45 rounded-[2px]"
              style={{
                background: rank.fill,
                boxShadow: `0 0 0 1.5px ${rank.edge}`,
              }}
            />
            <span className="font-(family-name:--font-heading) text-lg leading-tight font-semibold font-stretch-112%">
              {rank.name}
            </span>
            <span className="text-[11px] font-bold tracking-[.1em] text-accent uppercase">
              {rank.grade}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed">{rank.fact}</p>
          <button
            type="button"
            aria-label="Close fun fact"
            onClick={() => setOpen(null)}
            className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-sm text-ink/65 hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
      )}
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
