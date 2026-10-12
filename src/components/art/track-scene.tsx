'use client';

import {
  isStopped,
  raceAnnouncement,
  Racer,
  RacerState,
  raceSummary,
  randomRacer,
  simulateRace,
  stepRacer,
} from '@/lib/derby-race';
import { useEffect, useRef, useState } from 'react';
import { finishingOrder } from '@/lib/derby-race';
import { primeRobotVoice, speak } from '@/lib/robot-voice';
import { playSound, primeSound } from '@/lib/sound';
import { useToast } from '../toast';
import PinewoodCar from './pinewood-car';

// The track runs downhill from the start gate to the finish line.
const TRACK_START = { x: 40, y: 62 };
const TRACK_END = { x: 720, y: 146 };
const SLOPE = (TRACK_END.y - TRACK_START.y) / (TRACK_END.x - TRACK_START.x);
const ANGLE = (Math.atan(SLOPE) * 180) / Math.PI;
const FINISH_X = 652;

const CAR_WIDTH = 86;
// Cars are positioned by their back edge. A car finishes when its nose
// reaches the finish line.
const GATE_X = 44;
const FINISH_POSITION = FINISH_X - CAR_WIDTH + 6;
// The running surface is SURFACE deep with three staged, back to front. Each
// car keeps its own lane, like a real derby track.
const SURFACE = 16;
const EDGE = 8;
const LANE_DROP = 6;
const LANE_BASE = 2;
const COUNTDOWN_MS = 750;
// "Clack" and "Finished" by freesound_community, from Pixabay:
// https://pixabay.com/sound-effects/search/clack/
// https://pixabay.com/sound-effects/search/finished/
const GATE_SOUND = '/sounds/gate-clack.mp3';
const FINISH_SOUND = '/sounds/finish.mp3';

const CARS = [
  { x: 360, color: '#c62232', number: '27' },
  { x: 250, color: '#7fb5de', number: '2' },
  { x: 140, color: '#f5b919', number: '72' },
];
const HOME = CARS.map((car) => car.x);

// The finish gate bridge (the design team's <finish-gate>) straddles the
// finish line, where a car's nose crosses at FINISH_POSITION + CAR_WIDTH.
const VIEW_WIDTH = 760;
const GATE_WIDE = 44;
const GATE_TALL = 64;
const GATE_ANCHOR_X = FINISH_POSITION + CAR_WIDTH - GATE_WIDE / 2;

// The gate numbers lanes from the front, and CARS runs back lane first.
function laneOf(carIndex: number) {
  return CARS.length - carIndex;
}

type Phase = 'idle' | 'staging' | 'racing' | 'returning';

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
 * A downhill derby track with three cars. Tapping a car stages it at the
 * start gate and starts a countdown. Any car tapped before GO joins, and
 * the staged cars race from the gate.
 */
export default function TrackScene({ className }: { className?: string }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [positions, setPositions] = useState<number[]>(HOME);
  const [staged, setStaged] = useState<number[]>([]);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [litLanes, setLitLanes] = useState<number[]>([]);
  const [scale, setScale] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const gateRef = useRef<HTMLElement>(null);
  const showToast = useToast();
  const stagedRef = useRef<number[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const frame = useRef(0);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      cancelAnimationFrame(frame.current);
    },
    []
  );

  // The gate is an HTML overlay, so it scales with the rendered track.
  useEffect(() => {
    import('./finish-gate.js');
    const svg = svgRef.current;
    if (!svg) {
      return;
    }
    const observer = new ResizeObserver(() =>
      setScale(svg.clientWidth / VIEW_WIDTH)
    );
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  // Set attributes directly: React would assign the read-only lanes property.
  useEffect(() => {
    const gate = gateRef.current;
    if (!gate || !scale) {
      return;
    }
    const attributes = {
      lanes: CARS.length,
      dy: -SURFACE,
      slope: SLOPE.toFixed(4),
      tall: GATE_TALL,
      wide: GATE_WIDE,
      scale: scale.toFixed(4),
    };
    for (const [name, value] of Object.entries(attributes)) {
      if (gate.getAttribute(name) !== String(value)) {
        gate.setAttribute(name, String(value));
      }
    }
  }, [scale]);

  useEffect(() => {
    gateRef.current?.setAttribute('lit', litLanes.join(','));
  }, [litLanes]);

  function later(ms: number, fn: () => void) {
    timers.current.push(setTimeout(fn, ms));
  }

  function returnHome() {
    setPhase('returning');
    setPositions(HOME);
    later(800, () => {
      stagedRef.current = [];
      setStaged([]);
      setPhase('idle');
    });
  }

  function startRace() {
    playSound(GATE_SOUND, 0.8);

    // Read the ref, not state: this runs from the countdown timer.
    const entrants = stagedRef.current;
    const racers: Racer[] = entrants.map(() => randomRacer());
    const numbers = entrants.map((index) => CARS[index].number);
    const distance = FINISH_POSITION - GATE_X;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const times = simulateRace(racers, distance);
      setLitLanes(finishingOrder(times).map((i) => laneOf(entrants[i])));
      playSound(FINISH_SOUND);
      showToast(raceSummary(numbers, times, distance));
      speak(raceAnnouncement(numbers, times, distance));
      returnHome();
      return;
    }

    setPhase('racing');
    let states: RacerState[] = entrants.map(() => ({
      position: 0,
      speed: 0,
      finishedAt: null,
    }));
    let elapsed = 0;
    let winnerCrossed = false;
    const crossed = new Set<number>();
    let last: number | null = null;
    function tick(now: number) {
      const dt = last === null ? 0 : Math.min((now - last) / 1000, 1 / 30);
      last = now;
      states = states.map((state, i) =>
        stepRacer(racers[i], state, dt, elapsed, distance)
      );
      elapsed += dt;
      states.forEach((state, i) => {
        if (state.finishedAt !== null && !crossed.has(i)) {
          crossed.add(i);
          setLitLanes((lit) => [...lit, laneOf(entrants[i])]);
        }
      });
      if (!winnerCrossed && states.some((state) => state.finishedAt !== null)) {
        winnerCrossed = true;
        playSound(FINISH_SOUND);
      }
      setPositions((current) => {
        const next = [...current];
        entrants.forEach((carIndex, i) => {
          next[carIndex] = GATE_X + states[i].position;
        });
        return next;
      });
      if (states.every(isStopped)) {
        const times = states.map((state) => state.finishedAt ?? Infinity);
        showToast(raceSummary(numbers, times, distance));
        speak(raceAnnouncement(numbers, times, distance));
        later(1600, returnHome);
        return;
      }
      frame.current = requestAnimationFrame(tick);
    }
    frame.current = requestAnimationFrame(tick);
  }

  function stage(index: number) {
    if (phase === 'racing' || phase === 'returning') {
      return;
    }
    if (stagedRef.current.includes(index)) {
      return;
    }
    stagedRef.current = [...stagedRef.current, index];
    setStaged(stagedRef.current);
    setPositions((current) =>
      current.map((x, i) => (i === index ? GATE_X : x))
    );
    if (phase === 'idle') {
      setLitLanes([]);
      // The race sounds play from timers, so unlock them during this tap.
      primeSound(GATE_SOUND);
      primeSound(FINISH_SOUND);
      primeRobotVoice();
      setPhase('staging');
      showToast('Get ready! Tap more cars to join the race.');
      ['3', '2', '1', 'GO!'].forEach((label, i) =>
        later(i * COUNTDOWN_MS, () => setCountdown(label))
      );
      later(3 * COUNTDOWN_MS, startRace);
      later(4 * COUNTDOWN_MS, () => setCountdown(null));
    }
  }

  // Cars are listed back lane first, so nearer cars pass in front.

  return (
    <div className={`relative ${className ?? ''}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} 190`}
        className="block w-full"
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

        {/* Track supports, running surface with staged, and front edge. */}
        {[120, 300, 480, 660].map((x) => (
          <rect
            key={x}
            x={x - 3}
            y={trackY(x) + SURFACE + EDGE}
            width={6}
            height={182 - trackY(x) - SURFACE - EDGE}
            fill="#a86d36"
          />
        ))}
        <path
          d={`M${TRACK_START.x} ${TRACK_START.y + SURFACE} L${TRACK_END.x} ${TRACK_END.y + SURFACE} L${TRACK_END.x} ${TRACK_END.y + SURFACE + EDGE} L${TRACK_START.x} ${TRACK_START.y + SURFACE + EDGE} Z`}
          fill="#a86d36"
          stroke="#7a5230"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <path
          d={`M${TRACK_START.x} ${TRACK_START.y} L${TRACK_END.x} ${TRACK_END.y} L${TRACK_END.x} ${TRACK_END.y + SURFACE} L${TRACK_START.x} ${TRACK_START.y + SURFACE} Z`}
          fill="#d9a066"
          stroke="#7a5230"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {[5.5, 10.5].map((offset) => (
          <path
            key={offset}
            d={`M${TRACK_START.x + 4} ${TRACK_START.y + offset} L${TRACK_END.x - 4} ${TRACK_END.y + offset}`}
            stroke="#7a5230"
            strokeOpacity={0.45}
            strokeDasharray="14 10"
          />
        ))}
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

        {/* Checkered finish line. The finish gate overlay stands over it. */}
        <g
          transform={`translate(${FINISH_X} ${trackY(FINISH_X)}) skewY(${ANGLE})`}
        >
          {Array.from({ length: 8 }, (_, i) => (
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

        {countdown && (
          <text
            key={countdown}
            x={118}
            y={40}
            textAnchor="middle"
            fontSize={countdown === 'GO!' ? 26 : 30}
            fontWeight={800}
            fontFamily="var(--font-heading), sans-serif"
            fill={countdown === 'GO!' ? 'var(--cs-red)' : 'var(--accent)'}
            className="motion-safe:animate-[countdown-pop_.75s_ease-out]"
            style={{ transformOrigin: '118px 30px', transformBox: 'view-box' }}
          >
            {countdown}
          </text>
        )}

        {/* Cars. Each one sits on the board, tilted to the slope. */}
        {CARS.map((car, index) => {
          const x = positions[index];
          const moving =
            phase === 'racing'
              ? staged.includes(index)
              : x !== HOME[index] && phase !== 'idle';
          const y = trackY(x) - 33 + LANE_BASE + index * LANE_DROP;
          const tappable = phase === 'idle' || phase === 'staging';
          return (
            <g
              key={car.number}
              role="button"
              tabIndex={tappable ? 0 : -1}
              aria-label={`Race car ${car.number}`}
              aria-pressed={staged.includes(index)}
              className={`outline-none [&:focus-visible>svg]:drop-shadow-[0_0_3px_var(--accent)] ${
                tappable ? 'cursor-pointer' : ''
              }`}
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${ANGLE}deg)`,
                transition:
                  phase === 'staging' || phase === 'returning'
                    ? 'transform .6s ease-in-out'
                    : undefined,
              }}
              onClick={() => stage(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  stage(index);
                }
              }}
            >
              {phase === 'racing' && staged.includes(index) && (
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
                rolling={moving}
                x={0}
                y={0}
                width={CAR_WIDTH}
              />
            </g>
          );
        })}
      </svg>
      {/* Drawn after the cars, so they drive through the gate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute size-0"
        style={{
          left: GATE_ANCHOR_X * scale,
          top: (trackY(GATE_ANCHOR_X) + SURFACE) * scale,
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        <finish-gate ref={gateRef} />
      </div>
    </div>
  );
}
