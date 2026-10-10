'use client';

import { useState } from 'react';
import { useToast } from '../toast';
import PinewoodCar from './pinewood-car';

// The track runs downhill from the start gate to the finish line.
const TRACK_START = { x: 40, y: 62 };
const TRACK_END = { x: 720, y: 146 };
const SLOPE = (TRACK_END.y - TRACK_START.y) / (TRACK_END.x - TRACK_START.x);
const ANGLE = (Math.atan(SLOPE) * 180) / Math.PI;
const FINISH_X = 652;

const CARS = [
  { x: 360, color: '#c62232', number: '27' },
  { x: 250, color: '#7fb5de', number: '2' },
  { x: 140, color: '#f5b919', number: '72' },
];

function trackY(x: number) {
  return TRACK_START.y + (x - TRACK_START.x) * SLOPE;
}

function Pine({ x, height }: { x: number; height: number }) {
  const base = 150;
  const w = height * 0.42;
  return (
    <g>
      <rect x={x - 3} y={base - 12} width={6} height={12} fill="#7a5230" />
      <path
        d={`M${x} ${base - height} L${x + w * 0.62} ${base - height * 0.55} L${x + w * 0.38} ${base - height * 0.55} L${x + w} ${base - 10} L${x - w} ${base - 10} L${x - w * 0.38} ${base - height * 0.55} L${x - w * 0.62} ${base - height * 0.55} Z`}
        fill="currentColor"
      />
    </g>
  );
}

/**
 * A downhill derby track with three cars mid-race. Clicking a car sends it
 * to the finish line.
 */
export default function TrackScene({ className }: { className?: string }) {
  const [racing, setRacing] = useState<number | null>(null);
  const showToast = useToast();

  function race(index: number) {
    if (racing !== null) {
      return;
    }
    setRacing(index);
    setTimeout(() => {
      showToast(`Car #${CARS[index].number} crosses the line first!`);
    }, 900);
    setTimeout(() => setRacing(null), 2600);
  }

  return (
    <svg
      viewBox="0 0 760 190"
      className={className}
      role="img"
      aria-label="Three pinewood derby cars racing down a wooden track"
    >
      {/* Daytime sun, or a moon and stars at night. */}
      <g className="dark:hidden">
        <circle cx={690} cy={38} r={18} fill="var(--cs-yellow)" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={690 + Math.cos(a) * 25}
              y1={38 + Math.sin(a) * 25}
              x2={690 + Math.cos(a) * 32}
              y2={38 + Math.sin(a) * 32}
              stroke="var(--cs-yellow)"
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <g className="hidden dark:inline">
        <path
          d="M700 22 a18 18 0 1 0 14 30 a14 14 0 1 1 -14 -30 Z"
          fill="#f3efe4"
        />
        {[
          [610, 20],
          [560, 44],
          [640, 64],
          [500, 18],
          [735, 82],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={1.6}
            fill="#f3efe4"
            className="motion-safe:animate-[twinkle_3s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.6}s` }}
          />
        ))}
      </g>

      {/* Pines behind the track. */}
      <g className="text-ink/12">
        <Pine x={80} height={70} />
        <Pine x={118} height={52} />
        <Pine x={455} height={88} />
        <Pine x={500} height={64} />
        <Pine x={585} height={78} />
      </g>

      {/* Track supports, board and lane line. */}
      {[120, 300, 480, 660].map((x) => (
        <rect
          key={x}
          x={x - 3}
          y={trackY(x) + 10}
          width={6}
          height={182 - trackY(x) - 10}
          fill="#a86d36"
        />
      ))}
      <path
        d={`M${TRACK_START.x} ${TRACK_START.y} L${TRACK_END.x} ${TRACK_END.y} L${TRACK_END.x} ${TRACK_END.y + 12} L${TRACK_START.x} ${TRACK_START.y + 12} Z`}
        fill="#c98a4b"
        stroke="#7a5230"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d={`M${TRACK_START.x + 6} ${TRACK_START.y + 6} L${TRACK_END.x - 6} ${TRACK_END.y + 6}`}
        stroke="#7a5230"
        strokeOpacity={0.5}
        strokeDasharray="14 10"
      />
      <line
        x1={12}
        y1={182}
        x2={748}
        y2={182}
        stroke="var(--divider)"
        strokeWidth={2}
      />

      {/* Start gate with a 272 pennant. */}
      <rect x={34} y={18} width={5} height={56} fill="#7a5230" />
      <path d="M39 20 L74 28 L39 36 Z" fill="var(--cs-red)" />
      <text
        x={52}
        y={31}
        textAnchor="middle"
        fontSize={8}
        fontWeight={700}
        fill="#fff"
        fontFamily="var(--font-heading), sans-serif"
      >
        272
      </text>

      {/* Checkered finish line and flag. */}
      <g
        transform={`translate(${FINISH_X} ${trackY(FINISH_X)}) rotate(${ANGLE})`}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <rect
            key={i}
            x={(i % 2) * 6}
            y={Math.floor(i / 2) * 4}
            width={6}
            height={4}
            fill={i % 2 === Math.floor(i / 2) % 2 ? '#15214a' : '#f3efe4'}
          />
        ))}
      </g>
      <rect
        x={FINISH_X + 30}
        y={trackY(FINISH_X) - 62}
        width={3}
        height={62}
        fill="currentColor"
        className="text-ink/60"
      />
      <g transform={`translate(${FINISH_X + 33} ${trackY(FINISH_X) - 62})`}>
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x={(i % 4) * 7}
            y={Math.floor(i / 4) * 7}
            width={7}
            height={7}
            fill={(i + Math.floor(i / 4)) % 2 ? '#f3efe4' : '#15214a'}
          />
        ))}
      </g>

      {/* Cars. Each one sits on the board, tilted to the slope. */}
      {CARS.map((car, index) => {
        const finished = racing === index;
        const dx = finished ? FINISH_X + 20 - car.x : 0;
        return (
          <g
            key={car.number}
            transform={`translate(${car.x} ${trackY(car.x) - 33}) rotate(${ANGLE})`}
          >
            <g
              role="button"
              tabIndex={0}
              aria-label={`Race car ${car.number}`}
              className="cursor-pointer outline-none [&:focus-visible>svg]:drop-shadow-[0_0_3px_var(--accent)]"
              style={{
                transform: `translateX(${dx}px)`,
                transition: finished
                  ? 'transform .9s cubic-bezier(.55,0,.75,.4)'
                  : 'transform .6s ease-out',
              }}
              onClick={() => race(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  race(index);
                }
              }}
            >
              {finished && (
                <g
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="text-ink/40"
                >
                  <line x1={-30} y1={14} x2={-8} y2={14} />
                  <line x1={-40} y1={22} x2={-10} y2={22} />
                  <line x1={-26} y1={30} x2={-6} y2={30} />
                </g>
              )}
              <PinewoodCar
                color={car.color}
                number={car.number}
                rolling={finished}
                x={0}
                y={0}
                width={86}
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
