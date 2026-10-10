'use client';

import { useState } from 'react';
import Compass from './art/compass';
import { useToast } from './toast';

const SPARKS = [-34, -18, -6, 8, 20, 36];

// Stars in the night sky. The first eight trace a pinewood car.
const CAR_CONSTELLATION = [
  [880, 34],
  [902, 22],
  [930, 20],
  [946, 32],
  [976, 36],
  [972, 46],
  [886, 46],
  [880, 34],
];
const STARS = [
  [120, 30],
  [210, 54],
  [330, 22],
  [520, 40],
  [640, 18],
  [760, 50],
  [1060, 28],
  [1140, 58],
];

function Pine({ x, height }: { x: number; height: number }) {
  const w = height * 0.4;
  return (
    <path
      d={`M${x} ${140 - height} L${x + w * 0.6} ${140 - height * 0.55} L${x + w * 0.35} ${140 - height * 0.55} L${x + w} 138 L${x - w} 138 L${x - w * 0.35} ${140 - height * 0.55} L${x - w * 0.6} ${140 - height * 0.55} Z`}
      fill="currentColor"
    />
  );
}

/**
 * The campsite at the bottom of every page: a rope with a square knot,
 * tents, pines and a campfire that throws sparks when clicked.
 */
export default function SiteFooter() {
  const [sparking, setSparking] = useState(0);
  const showToast = useToast();

  function stokeFire() {
    setSparking((n) => n + 1);
    showToast('S’mores time! Toast your marshmallow golden, not black.');
  }

  return (
    <footer className="mt-16" aria-label="Pack 272 campsite">
      <div className="relative flex items-center">
        <div className="h-2.5 flex-1 rounded-full bg-[repeating-linear-gradient(-55deg,#c9a46a_0_6px,#a9824a_6px_9px)]" />
        <svg
          viewBox="0 0 64 28"
          className="absolute left-1/2 h-7 w-16 -translate-x-1/2"
          aria-hidden
        >
          <path
            d="M2 14 C14 14 18 4 28 6 C36 8 34 20 42 22 C50 24 54 14 62 14"
            fill="none"
            stroke="#a9824a"
            strokeWidth={7}
            strokeLinecap="round"
          />
          <path
            d="M2 14 C14 14 18 24 28 22 C36 20 34 8 42 6 C50 4 54 14 62 14"
            fill="none"
            stroke="#c9a46a"
            strokeWidth={7}
            strokeLinecap="round"
          />
        </svg>
      </div>

      <svg
        viewBox="0 0 1200 140"
        preserveAspectRatio="xMidYMax slice"
        className="block h-[140px] w-full"
        role="img"
        aria-label="A campsite with tents, pine trees and a campfire"
      >
        <g className="hidden dark:inline">
          {STARS.map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={1.5}
              fill="#f3efe4"
              className="motion-safe:animate-[twinkle_4s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
          <polyline
            points={CAR_CONSTELLATION.map((p) => p.join(',')).join(' ')}
            fill="none"
            stroke="#f3efe4"
            strokeOpacity={0.18}
            strokeDasharray="2 3"
          />
          {CAR_CONSTELLATION.slice(0, 7).map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={1.8} fill="#f3efe4" />
          ))}
          <circle cx={896} cy={50} r={2.2} fill="#f5b919" />
          <circle cx={962} cy={50} r={2.2} fill="#f5b919" />
        </g>

        <g className="text-ink/14">
          <Pine x={70} height={96} />
          <Pine x={130} height={70} />
          <Pine x={240} height={110} />
          <Pine x={830} height={84} />
          <Pine x={1010} height={118} />
          <Pine x={1090} height={78} />
          <Pine x={1160} height={100} />
        </g>

        {/* Tents. */}
        <g>
          <path
            d="M330 138 L388 62 L446 138 Z"
            fill="#e8671c"
            stroke="#15214a"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path
            d="M388 62 L370 138 L406 138 Z"
            fill="#15214a"
            fillOpacity={0.85}
          />
          <line
            x1={388}
            y1={62}
            x2={388}
            y2={52}
            stroke="#15214a"
            strokeWidth={2}
          />
          <path d="M388 52 L402 56 L388 60 Z" fill="var(--cs-yellow)" />
        </g>
        <g>
          <path
            d="M740 138 L786 78 L832 138 Z"
            fill="#1f3a80"
            stroke="#15214a"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path
            d="M786 78 L772 138 L800 138 Z"
            fill="var(--cs-yellow)"
            fillOpacity={0.9}
          />
        </g>

        {/* Campfire. */}
        <g
          role="button"
          tabIndex={0}
          aria-label="Stoke the campfire"
          className="cursor-pointer outline-none [&:focus-visible]:drop-shadow-[0_0_4px_var(--accent)]"
          onClick={stokeFire}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              stokeFire();
            }
          }}
        >
          <ellipse
            cx={590}
            cy={130}
            rx={44}
            ry={8}
            fill="var(--cs-yellow)"
            fillOpacity={0.18}
          />
          <g
            className="motion-safe:animate-[flame-flicker_1.2s_ease-in-out_infinite]"
            style={{ transformOrigin: '590px 128px', transformBox: 'view-box' }}
          >
            <path
              d="M590 72 C606 92 612 104 606 118 C602 128 578 128 574 118 C568 104 576 94 590 72 Z"
              fill="#e8671c"
            />
            <path
              d="M590 90 C600 102 602 110 598 120 C594 126 586 126 582 120 C578 110 582 102 590 90 Z"
              fill="var(--cs-yellow)"
            />
          </g>
          <rect
            x={556}
            y={122}
            width={68}
            height={9}
            rx={4.5}
            fill="#7a5230"
            transform="rotate(-10 590 126)"
          />
          <rect
            x={556}
            y={122}
            width={68}
            height={9}
            rx={4.5}
            fill="#a86d36"
            transform="rotate(10 590 126)"
          />
          {sparking > 0 &&
            SPARKS.map((x, i) => (
              <circle
                key={`${sparking}-${i}`}
                cx={590}
                cy={96}
                r={2.5}
                fill="var(--cs-yellow)"
                className="motion-safe:animate-[spark-rise_1.1s_ease-out_forwards] motion-reduce:hidden"
                style={
                  {
                    '--spark-x': `${x}px`,
                    animationDelay: `${i * 0.06}s`,
                    transformBox: 'view-box',
                  } as React.CSSProperties
                }
              />
            ))}
        </g>

        <line
          x1={0}
          y1={139}
          x2={1200}
          y2={139}
          stroke="var(--divider)"
          strokeWidth={2}
        />
      </svg>

      <div className="mx-auto flex max-w-[1040px] flex-wrap items-center gap-4 px-[clamp(20px,4vw,40px)] pt-5 pb-10">
        <Compass className="size-12 shrink-0" />
        <div>
          <div className="font-(family-name:--font-heading) font-semibold font-stretch-112%">
            Pack 272 · Do your best
          </div>
          <div className="text-sm text-ink/65">
            Built with sawdust, graphite and a little help from a grown-up.
          </div>
        </div>
      </div>
    </footer>
  );
}
